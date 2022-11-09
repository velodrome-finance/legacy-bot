import { DISCORD_ACCESS_TOKEN, DISCORD_ENABLED, TELEGRAM_ENABLED, TWITTER_ENABLED } from './secrets'
import { DiscordClient } from './clients/discordClient'
import { Client } from 'discord.js'
import RpcClient from './clients/client'
import { TwitterApi } from 'twitter-api-v2'
import { Context, Telegraf } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { defaultActivity } from './integrations/discord'
import { TwitterClient } from './clients/twitterClient'
import { TelegramClient } from './clients/telegramClient'
import { GetPrices } from './integrations/coingecko'
import { TrackEvents } from './event/blockEvent'
import { ScheduledJobs } from './schedule'
import { alchemyProvider, optimismInfuraProvider } from './clients/ethersClient'
import { GetVeloData } from './integrations/velo'

let discordClient: Client<boolean>
let twitterClient: TwitterApi
let telegramClient: Telegraf<Context<Update>>

export async function goBot() {
  const rpcClient = new RpcClient(alchemyProvider)
  await SetUpDiscord()
  await SetUpTwitter()
  //await SetUpTelegram()

  global.ENS = {}
  global.TOKEN_PRICES = {}
  global.TOKEN_IMAGES = {}
  global.VELO_DATA = []
  global.PAIR_ADDRESSES = []
  global.BRIBE_ADDRESSES = []

  await GetPrices()
  await GetVeloData()

  await TrackEvents(discordClient, telegramClient, twitterClient, rpcClient)
  ScheduledJobs()
}

export async function SetUpDiscord() {
  if (DISCORD_ENABLED) {
    discordClient = DiscordClient
    discordClient.on('ready', async (client) => {
      console.debug('Discord Bot is online!')
    })
    await discordClient.login(DISCORD_ACCESS_TOKEN)
    await defaultActivity(discordClient)
  }
}

export async function SetUpTwitter() {
  if (TWITTER_ENABLED) {
    twitterClient = TwitterClient
    twitterClient.readWrite
  }
}

export async function SetUpTelegram() {
  if (TELEGRAM_ENABLED) {
    telegramClient = TelegramClient
  }
}
