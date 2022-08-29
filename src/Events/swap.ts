import {
  DISCORD_CHANNEL_SWAP,
  DISCORD_ENABLED,
  DISCORD_SWAP_THRESHOLD,
  GLOBAL_SWAP_THRESHOLD,
  TELEGRAM_ENABLED,
  TWITTER_ENABLED,
} from '../secrets'
import fromBigNumber from '../utils/fromBigNumber'
import { Client, MessageAttachment } from 'discord.js'
import { SwapDto } from '../types/dtos'
import { GetNotableAddress } from '../utils/notableAddresses'
import { firstAddress, toDate } from '../utils/utils'
import RpcClient from '../clients/client'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { TwitterApi } from 'twitter-api-v2'
import { Event as GenericEvent } from 'ethers'
import { SwapEvent } from '../contracts/typechain/VelodromePair'
import { VelodromePair__factory } from '../contracts/typechain'
import { PAIR_ADDRESSES } from '../constants/pairAddresses'
import { SwapDiscord, SwapTwitter } from '../templates/swap'
import { SendTweet } from '../integrations/twitter'
import { PostDiscord } from '../integrations/discord'
import { getMergedThumbnail } from '../utils/mergedImage'

export async function TrackSwap(
  discordClient: Client<boolean>,
  telegramClient: Telegraf<Context<Update>>,
  twitterClient: TwitterApi,
  rpcClient: RpcClient,
  genericEvent: GenericEvent,
): Promise<void> {
  // console.log(genericEvent)
  // console.log(isDeposit)
  const event = parseEvent(genericEvent as SwapEvent)
  //printObject(event)

  try {
    let timestamp = 0
    const pair = PAIR_ADDRESSES[event.address]
    const token0Dec = pair[0][2]
    const token1Dec = pair[1][2]
    const amount0In = fromBigNumber(event.args.amount0In, token0Dec as number)
    const amount1In = fromBigNumber(event.args.amount1In, token1Dec as number)
    const amount0Out = fromBigNumber(event.args.amount0Out, token0Dec as number)
    const amount1Out = fromBigNumber(event.args.amount1Out, token1Dec as number)
    const token0Price = TOKEN_PRICES[pair[0][0]]
    const token1Price = TOKEN_PRICES[pair[1][0]]
    const amount0InValue = amount0In * (token0Price as unknown as number)
    const amount1InValue = amount1In * (token1Price as unknown as number)
    const amount0OutValue = amount0Out * (token0Price as unknown as number)
    const amount1OutValue = amount1Out * (token1Price as unknown as number)

    const totalValue = amount0In > 0 ? amount0InValue : amount1InValue

    if (totalValue >= DISCORD_SWAP_THRESHOLD) {
      console.log(`Swap found: $${totalValue}`)
      try {
        timestamp = (await rpcClient.provider.getBlock(event.blockNumber)).timestamp
      } catch (ex) {
        console.log(ex)
      }
      const from = GetNotableAddress(event.args.sender)
      const to = GetNotableAddress(event.address)
      const img64 = (await getMergedThumbnail(pair[0], pair[1])) ?? ''

      const dto: SwapDto = {
        from: from === '' ? firstAddress(event.args.sender) : event.args.sender,
        to: to === '' ? firstAddress(event.address) : to,
        amount0In: amount0In,
        amount0InValue: amount0InValue,
        amount1In: amount1In,
        amount1InValue: amount1InValue,
        amount0Out: amount0Out,
        amount0OutValue: amount0OutValue,
        amount1Out: amount1Out,
        amount1OutValue: amount1OutValue,
        transactionHash: event.transactionHash,
        fromEns: '',
        toEns: '',
        timestamp: timestamp === 0 ? toDate(Date.now()) : toDate(timestamp),
        blockNumber: event.blockNumber,
        notableTo: to !== '',
        notableFrom: from !== '',
        fromAddress: event.args.sender,
        toAddress: event.address,
        token0Symbol: pair[0][1] as string,
        token1Symbol: pair[1][1] as string,
        imageUrl: '',
        img64: img64,
        totalValue: totalValue,
      }

      BroadCastMint(dto, discordClient, telegramClient, twitterClient)
    } else {
      console.log(`Swap found: $${totalValue}, smaller than ${DISCORD_SWAP_THRESHOLD} threshold.`)
    }
  } catch (e) {
    console.log(e)
  }
}

export function parseEvent(event: SwapEvent): SwapEvent {
  const parsedEvent = VelodromePair__factory.createInterface().parseLog(event)
  if ((parsedEvent.args as SwapEvent['args']).length > 0) {
    event.args = parsedEvent.args as SwapEvent['args']
  }
  return event
}

export async function BroadCastMint(
  dto: SwapDto,
  discordClient: Client<boolean>,
  telegramClient: Telegraf<Context<Update>>,
  twitterClient: TwitterApi,
): Promise<void> {
  if (DISCORD_ENABLED) {
    const post = SwapDiscord(dto)
    const buffer = Buffer.from(dto.img64, 'base64')
    const att = new MessageAttachment(buffer, 'buffer.png')
    await PostDiscord(post, discordClient, DISCORD_CHANNEL_SWAP, [att])
  }
  if (TELEGRAM_ENABLED) {
    // const post = TransferTelegram(transferDto)
    // await PostTelegram(post, telegramClient)
  }

  if (TWITTER_ENABLED && dto.totalValue >= GLOBAL_SWAP_THRESHOLD) {
    const post = SwapTwitter(dto)
    console.log(post)
    await SendTweet(post, twitterClient)
  }
}
