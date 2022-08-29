import { DISCORD_ENABLED, GLOBAL_THRESHOLD, TELEGRAM_ENABLED, TWITTER_ENABLED } from '../secrets'
import fromBigNumber from '../utils/fromBigNumber'
import { Client } from 'discord.js'
import { TransferDto } from '../types/dtos'
import { PostDiscord } from '../integrations/discord'
import { TransferDiscord, TransferTelegram, TransferTwitter } from '../templates/transfer'
import { GetEns } from '../integrations/ens'
import { GetNotableAddress } from '../utils/notableAddresses'
import { firstAddress, toDate } from '../utils/utils'
import RpcClient from '../clients/client'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { PostTelegram } from '../integrations/telegram'
import { SendTweet } from '../integrations/twitter'
import { TwitterApi } from 'twitter-api-v2'
import { TransferEvent } from '@lyrafinance/lyra-js/dist/types/contracts/typechain/ERC20'
import { Event as GenericEvent } from 'ethers'
import { ERC20, ERC20__factory } from '@lyrafinance/lyra-js'
import { ZERO_ADDRESS } from '../constants/bn'

export async function TrackTransfer(
  discordClient: Client<boolean>,
  telegramClient: Telegraf<Context<Update>>,
  twitterClient: TwitterApi,
  rpcClient: RpcClient,
  genericEvent: GenericEvent,
): Promise<void> {
  const event = parseEvent(genericEvent as TransferEvent)
  const amount = fromBigNumber(event.args.value)
  const value = global.PRICE * amount
  console.log(value)

  if (value >= GLOBAL_THRESHOLD) {
    try {
      let timestamp = 0

      try {
        timestamp = (await rpcClient.provider.getBlock(event.blockNumber)).timestamp
      } catch (ex) {
        console.log(ex)
      }
      const from = GetNotableAddress(event.args.from)
      const to = GetNotableAddress(event.args.to)
      const fromEns = await GetEns(event.args.from)
      const toEns = await GetEns(event.args.to)

      const transferDto: TransferDto = {
        from: from === '' ? firstAddress(event.args.from) : from,
        to: to === '' ? firstAddress(event.args.to) : to,
        amount: amount,
        transactionHash: event.transactionHash,
        fromEns: fromEns,
        toEns: toEns,
        timestamp: timestamp === 0 ? toDate(Date.now()) : toDate(timestamp),
        blockNumber: event.blockNumber,
        value: value,
        notableTo: to !== '',
        notableFrom: from !== '',
        fromAddress: event.args.from,
        toAddress: event.args.to,
      }
      console.log('Transfer Found')

      await BroadCastTransfer(transferDto, discordClient, telegramClient, twitterClient)
    } catch (ex) {
      console.log(ex)
    }
  } else {
    console.log('Transfer less than threshold value')
  }
}

export function parseEvent(event: TransferEvent): TransferEvent {
  const parsedEvent = ERC20__factory.createInterface().parseLog(event)

  if ((parsedEvent.args as TransferEvent['args']).length > 0) {
    event.args = parsedEvent.args as TransferEvent['args']
  }
  return event
}

export async function BroadCastTransfer(
  transferDto: TransferDto,
  discordClient: Client<boolean>,
  telegramClient: Telegraf<Context<Update>>,
  twitterClient: TwitterApi,
): Promise<void> {
  if (DISCORD_ENABLED) {
    const post = TransferDiscord(transferDto)
    await PostDiscord(post, discordClient, 'DISCORD_CHANNEL', [])
  }
  if (TELEGRAM_ENABLED) {
    const post = TransferTelegram(transferDto)
    await PostTelegram(post, telegramClient)
  }

  if (TWITTER_ENABLED) {
    const post = TransferTwitter(transferDto)
    await SendTweet(post, twitterClient)
  }
}
