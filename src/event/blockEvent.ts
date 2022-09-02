import { TESTNET } from '../secrets'
import { Client } from 'discord.js'
import { BlockEvent } from '../event'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { TwitterApi } from 'twitter-api-v2'
import { MINT_TOPIC, SWAP_TOPIC, TRANSFER_TOPIC } from '../constants/topics'
import { CONTRACT_ADDRESSES } from '../constants/appAddresses'
import { TrackMint } from '../Events/mint'
import { TrackSwap } from '../Events/swap'
import RpcClient from '../clients/client'

export async function TrackEvents(
  discordClient: Client<boolean>,
  telegramClient: Telegraf<Context<Update>>,
  twitterClient: TwitterApi,
  rpcClient: RpcClient,
): Promise<void> {
  console.log('### Polling Events ###')
  let blockNumber: number | undefined = undefined
  if (TESTNET) {
    blockNumber = rpcClient.provider.blockNumber - 500
  }
  BlockEvent.on(
    rpcClient,
    async (event) => {
      if (event.topics[0] === MINT_TOPIC) {
        await TrackMint(discordClient, telegramClient, twitterClient, rpcClient, event, true)
      } else if (event.topics[0] == SWAP_TOPIC) {
        await TrackSwap(discordClient, telegramClient, twitterClient, rpcClient, event)
      }
    },
    {
      startBlockNumber: blockNumber,
      addresses: CONTRACT_ADDRESSES,
      topics: [MINT_TOPIC, SWAP_TOPIC],
    },
  )
}
