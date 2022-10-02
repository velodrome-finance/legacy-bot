import { TESTNET } from '../secrets'
import { Client } from 'discord.js'
import { BlockEvent } from '../event'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { TwitterApi } from 'twitter-api-v2'
import { MINT_TOPIC, NOTIIFY_REWARD_AMOUNT, SWAP_TOPIC } from '../constants/topics'
import RpcClient from '../clients/client'
import { TrackDeposit } from './deposit'
import { TrackSwap } from './swap'
import { TrackBribe } from './bribe'

export async function TrackEvents(
  discordClient: Client<boolean>,
  telegramClient: Telegraf<Context<Update>>,
  twitterClient: TwitterApi,
  rpcClient: RpcClient,
): Promise<void> {
  console.log('### Polling Events ###')
  let blockNumber: number | undefined = undefined
  let pollInterval = 60000
  if (TESTNET) {
    blockNumber = rpcClient.provider.blockNumber - 500
    pollInterval = 1000
  }
  BlockEvent.on(
    rpcClient,
    async (event) => {
      if (event.topics[0] === MINT_TOPIC) {
        await TrackDeposit(discordClient, telegramClient, twitterClient, rpcClient, event)
      } else if (event.topics[0] === SWAP_TOPIC) {
        await TrackSwap(discordClient, telegramClient, twitterClient, rpcClient, event)
      } else if (event.topics[0] === NOTIIFY_REWARD_AMOUNT) {
        await TrackBribe(discordClient, telegramClient, twitterClient, rpcClient, event)
      }
    },
    {
      startBlockNumber: blockNumber,
      addresses: [...global.PAIR_ADDRESSES, ...global.BRIBE_ADDRESSES],
      topics: [NOTIIFY_REWARD_AMOUNT, MINT_TOPIC, SWAP_TOPIC],
      pollInterval: pollInterval,
    },
  )
}
