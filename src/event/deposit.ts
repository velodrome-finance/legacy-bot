import { DISCORD_DEPOSIT_THRESHOLD } from '../secrets'
import fromBigNumber from '../utils/fromBigNumber'
import { Client } from 'discord.js'
import { DepositWithdrawDto } from '../types/dtos'
import { GetNotableAddress } from '../utils/notableAddresses'
import { firstAddress, toDate } from '../utils/utils'
import RpcClient from '../clients/client'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { TwitterApi } from 'twitter-api-v2'
import { Event as GenericEvent } from 'ethers'
import { MintEvent } from '../contracts/typechain/VelodromePair'
import { VelodromePair__factory } from '../contracts/typechain'
import { PAIR_ADDRESSES } from '../constants/pairAddresses'
import { getMergedThumbnail } from '../utils/mergedImage'
import { EventType } from '../constants/eventType'
import { BroadCast } from './common'

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
    const pair = PAIR_ADDRESSES[event.address]
    const token0Dec = pair[0][2]
    const token1Dec = pair[1][2]
    const token0Amount = fromBigNumber(event.args.amount0, token0Dec as number)
    const token1Amount = fromBigNumber(event.args.amount1, token1Dec as number)
    const token0Price = TOKEN_PRICES[pair[0][0]]
    const token0Value = token0Amount * (token0Price as unknown as number)
    const token1Price = TOKEN_PRICES[pair[1][0]]
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
      const img64 = (await getMergedThumbnail(pair[0], pair[1])) ?? ''

      const dto: DepositWithdrawDto = {
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
        token0Symbol: pair[0][1] as string,
        token1Symbol: pair[1][1] as string,
        isDeposit: true,
        value: totalValue,
        imageUrl: '',
        img64: img64,
      }

      BroadCast(dto, twitterClient, telegramClient, discordClient)
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
