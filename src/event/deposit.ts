import { DISCORD_DEPOSIT_THRESHOLD } from '../secrets'
import fromBigNumber from '../utils/fromBigNumber'
import { Client } from 'discord.js'
import { DepositDto } from '../types/dtos'
import { GetNotableAddress } from '../utils/notableAddresses'
import { firstAddress, toDate } from '../utils/utils'
import RpcClient from '../clients/client'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { TwitterApi } from 'twitter-api-v2'
import { Event as GenericEvent } from 'ethers'
import { MintEvent } from '../contracts/typechain/VelodromePair'
import { VelodromePair__factory } from '../contracts/typechain'
import { getMergedThumbnail } from '../utils/mergedImage'
import { EventType } from '../constants/eventType'
import { BroadCast } from './common'
import { Pair } from '../types/velo'
import { TOKENS } from '../constants/tokenIds'
import { PriceToken } from './pricing'

export async function TrackDeposit(
  discordClient: Client<boolean>,
  telegramClient: Telegraf<Context<Update>>,
  twitterClient: TwitterApi,
  rpcClient: RpcClient,
  genericEvent: GenericEvent,
): Promise<void> {
  const event = parseEvent(genericEvent as MintEvent)
  try {
    let timestamp = 0
    const pairs: Pair[] = []

    VELO_DATA.map((pair) => {
      if (pair.address?.toLowerCase() === event.address.toLowerCase()) {
        pairs.push(pair)
      }
    })

    if (pairs.length == 0) {
      console.log('PAIR not found in API')
      return
    }

    const pair = pairs[0]

    const token0 = TOKENS[pair?.token0_address.toLowerCase() as string]
    const token1 = TOKENS[pair?.token1_address.toLowerCase() as string]

    if (token0 === undefined || token1 === undefined) {
      console.log('Token 0 not found' + pair?.token0_address)
      console.log('Token 1 not found' + pair?.token1_address)
      return
    }

    const token0Amount = fromBigNumber(event.args.amount0, token0[2] as number as number)
    const token1Amount = fromBigNumber(event.args.amount1, token1[2] as number as number)
    const token0Price = await PriceToken(token0, pair?.token0_address.toLowerCase() as string)
    const token0Value = token0Amount * (token0Price as unknown as number)
    const token1Price = await PriceToken(token1, pair?.token1_address.toLowerCase() as string)
    const token1Value = token1Amount * (token1Price as unknown as number)
    const totalValue = token0Value + token1Value

    if (totalValue >= DISCORD_DEPOSIT_THRESHOLD) {
      console.log(`Deposit found: $${totalValue}`)
      try {
        timestamp = (await rpcClient.provider.getBlock(event.blockNumber)).timestamp
      } catch (ex) {
        console.log(ex)
      }

      const from = GetNotableAddress(event.args.sender)
      const to = GetNotableAddress(event.address)
      const img64 = (await getMergedThumbnail(token0, token1)) ?? ''

      const dto: DepositDto = {
        eventType: EventType.Deposit,
        from: from === '' ? firstAddress(event.args.sender) : event.args.sender,
        to: to === '' ? firstAddress(event.address) : to,
        token0Amount: token0Amount,
        token1Amount: token1Amount,
        transactionHash: event.transactionHash,
        fromEns: '',
        toEns: '',
        timestamp: timestamp === 0 ? toDate(Date.now()) : toDate(timestamp),
        blockNumber: event.blockNumber,
        token0Value: token0Value,
        token1Value: token1Value,
        notableTo: to !== '',
        notableFrom: from !== '',
        fromAddress: event.args.sender,
        toAddress: event.address,
        token0Symbol: token0[1] as string,
        token1Symbol: token1[1] as string,
        isDeposit: true,
        value: totalValue,
        imageUrl: '',
        img64: img64,
      }

      await BroadCast(dto, twitterClient, telegramClient, discordClient)
    } else {
      console.log(`Deposit found: $${totalValue}, smaller than ${DISCORD_DEPOSIT_THRESHOLD} threshold.`)
    }
  } catch (e) {
    console.log(e)
  }
}

export function parseEvent(event: MintEvent): MintEvent {
  const parsedEvent = VelodromePair__factory.createInterface().parseLog(event)
  if ((parsedEvent.args as MintEvent['args']).length > 0) {
    event.args = parsedEvent.args as MintEvent['args']
  }
  return event
}
