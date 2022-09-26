import { DISCORD_BRIBE_THRESHOLD } from '../secrets'
import fromBigNumber from '../utils/fromBigNumber'
import { Client } from 'discord.js'
import { BribeDto } from '../types/dtos'
import { GetNotableAddress } from '../utils/notableAddresses'
import { firstAddress, toDate } from '../utils/utils'
import RpcClient from '../clients/client'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { TwitterApi } from 'twitter-api-v2'
import { Event as GenericEvent } from 'ethers'
import { WrappedExternalBribe__factory } from '../contracts/typechain'
import { getMergedThumbnail } from '../utils/mergedImage'
import { EventType } from '../constants/eventType'
import { BroadCast } from './common'
import { NotifyRewardEvent } from '../contracts/typechain/WrappedExternalBribe'
import { BRIBE_PAIR_ADDRESSES } from '../constants/appAddresses'
import { TOKENS, VELO } from '../constants/tokenIds'
import { GetEns } from '../integrations/ens'
import printObject from '../utils/printObject'

export async function TrackBribe(
  discordClient: Client<boolean>,
  telegramClient: Telegraf<Context<Update>>,
  twitterClient: TwitterApi,
  rpcClient: RpcClient,
  genericEvent: GenericEvent,
): Promise<void> {
  const event = parseEvent(genericEvent as NotifyRewardEvent)
  printObject(event)
  const bribeToken = TOKENS[event.args.reward.toLowerCase()]
  console.log(bribeToken)

  if (bribeToken !== undefined) {
    try {
      let timestamp = 0
      console.log(event.address)
      const pair = BRIBE_PAIR_ADDRESSES[event.address.toLowerCase()]
      const amount = fromBigNumber(event.args.amount, bribeToken[2] as number)
      const bribePrice = TOKEN_PRICES[bribeToken[0]] as unknown as number
      const value = amount * bribePrice

      if (value >= DISCORD_BRIBE_THRESHOLD) {
        console.log(`Bribe found: $${value}`)
        try {
          timestamp = (await rpcClient.provider.getBlock(event.blockNumber)).timestamp
        } catch (ex) {
          console.log(ex)
        }

        const from = GetNotableAddress(event.args.from)
        const img64 = (await getMergedThumbnail(pair[0], pair[1])) ?? ''

        const dto: BribeDto = {
          eventType: EventType.Bribe,
          from: from === '' ? firstAddress(event.args.from) : from,
          fromAddress: event.args.from,
          notableFrom: from !== '',
          transactionHash: event.transactionHash,
          fromEns: await GetEns(event.args.from),
          timestamp: timestamp === 0 ? toDate(Date.now()) : toDate(timestamp),
          blockNumber: event.blockNumber,
          toAddress: event.address,
          token0Symbol: pair[0][1] as string,
          token1Symbol: pair[1][1] as string,
          value: value,
          img64: img64,
          amount: amount,
          bribeTokenSymbol: bribeToken[1] as string,
        }

        await BroadCast(dto, twitterClient, telegramClient, discordClient)
      } else {
        console.log(`Bribe found: $${value}, smaller than ${DISCORD_BRIBE_THRESHOLD} threshold.`)
      }
    } catch (e) {
      console.log(e)
    }
  } else {
    console.log('Unknown bribe token - skipping')
  }
}

export function parseEvent(event: NotifyRewardEvent): NotifyRewardEvent {
  const parsedEvent = WrappedExternalBribe__factory.createInterface().parseLog(event)
  if ((parsedEvent.args as NotifyRewardEvent['args']).length > 0) {
    event.args = parsedEvent.args as NotifyRewardEvent['args']
  }
  return event
}
