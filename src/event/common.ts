import { AttachmentBuilder, Client, EmbedBuilder } from 'discord.js'
import { Telegraf, Context } from 'telegraf'
import { Update } from 'telegraf/typings/core/types/typegram'
import { TwitterApi } from 'twitter-api-v2'
import { EventType } from '../constants/eventType'
import { PostDiscord } from '../integrations/discord'
import { SendTweet } from '../integrations/twitter'
import {
  TWITTER_ENABLED,
  TESTNET,
  DISCORD_ENABLED,
  GLOBAL_SWAP_THRESHOLD,
  DISCORD_CHANNEL_SWAP,
  DISCORD_CHANNEL_DEPOSIT,
  DISCORD_CHANNEL_BRIBE,
  GLOBAL_THRESHOLD,
  DISCORD_DEPOSIT_THRESHOLD,
} from '../secrets'
import { DepositDiscord, DepositTwitter } from '../templates/deposit'
import { SwapDiscord, SwapTwitter } from '../templates/swap'
import { BaseEvent, DepositWithdrawDto, SwapDto } from '../types/dtos'
import printObject from '../utils/printObject'

export async function BroadCast<T extends BaseEvent>(
  dto: T,
  twitterClient: TwitterApi,
  telegramClient: Telegraf<Context<Update>>,
  discordClient: Client<boolean>,
): Promise<void> {
  if (TWITTER_ENABLED) {
    let post = ''
    if (dto.eventType == EventType.Swap) {
      if (dto.value >= GLOBAL_SWAP_THRESHOLD) {
        post = SwapTwitter(dto as unknown as SwapDto)
      }
    } else if (dto.eventType === EventType.Deposit) {
      if (dto.value >= GLOBAL_THRESHOLD) {
        post = DepositTwitter(dto as unknown as DepositWithdrawDto)
      }
    }

    if (TESTNET) {
      console.log(post)
    } else {
      if (post != '') {
        await SendTweet(post, twitterClient)
      }
    }
  }

  if (DISCORD_ENABLED) {
    let embed: EmbedBuilder[] = []
    let att = {} as AttachmentBuilder

    if (dto.eventType == EventType.Swap) {
      if (dto.value >= GLOBAL_SWAP_THRESHOLD) {
        embed = SwapDiscord(dto as unknown as SwapDto)
        const buffer = Buffer.from((dto as unknown as SwapDto).img64, 'base64')
        att = new AttachmentBuilder(buffer, { name: 'buffer.png' })
      }
    } else if (dto.eventType == EventType.Deposit) {
      if (dto.value >= DISCORD_DEPOSIT_THRESHOLD) {
        embed = DepositDiscord(dto as unknown as DepositWithdrawDto)
        const buffer = Buffer.from((dto as unknown as DepositWithdrawDto).img64, 'base64')
        att = new AttachmentBuilder(buffer, { name: 'buffer.png' })
      }
    }

    if (TESTNET) {
      printObject(embed)
    } else {
      if (embed.length > 0) {
        let channel = ''

        if (dto.eventType == EventType.Swap) {
          channel = DISCORD_CHANNEL_SWAP
        }

        if (dto.eventType == EventType.Deposit) {
          channel = DISCORD_CHANNEL_DEPOSIT
        }

        if (dto.eventType == EventType.Bribe) {
          channel = DISCORD_CHANNEL_BRIBE
        }

        PostDiscord(embed, discordClient, channel, [att])
      }
    }
  }
}
