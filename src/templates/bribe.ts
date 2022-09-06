import { EmbedBuilder } from 'discord.js'
import { staticIcons } from '../constants/staticIcons'
import { BribeDto } from '../types/dtos'
import { EtherScanTransactionLink, FN } from './common'

export function BribeTwitter(dto: BribeDto) {
  const post: string[] = []
  post.push(`$${FN(dto.value, 2)} (${FN(dto.amount, 2)}) $VELO bribe\n\n`)

  post.push(`To incentivize Voters to vote for the \n`)
  post.push(`🔵 $${dto.token0Symbol}/$${dto.token1Symbol} Pool\n\n`)

  post.push(`From ${dto.fromEns ? dto.fromEns : dto.notableFrom ? dto.from : '🧑 ' + dto.fromAddress}\n`)
  post.push(`🔗 ${EtherScanTransactionLink(dto.transactionHash)}\n\n`)
  post.push(`Trade and earn on Velodrome today 👇\n`)
  post.push(`https://app.velodrome.finance`)
  return post.join('')
}

export function BribeDiscord(dto: BribeDto): EmbedBuilder[] {
  const messageEmbeds: EmbedBuilder[] = []
  const embed = new EmbedBuilder()
    .setColor('#00ff7f')
    .setURL(`${EtherScanTransactionLink(dto.transactionHash)}`)
    .setFooter({
      iconURL: staticIcons.velodromeIconSmall,
      text: `Velodrome`,
    })
    .setTimestamp()
    .setThumbnail('attachment://buffer.png')
    .setTitle(`$${FN(dto.value, 2)} ${dto.token0Symbol}/${dto.token1Symbol} Bribe`)
    .addFields(
      {
        name: `Pool`,
        value: `> 🔵 ${dto.token0Symbol}/${dto.token1Symbol}`,
        inline: false,
      },
      {
        name: `VELO`,
        value: `> 🔸 ${FN(dto.amount, 2)}`,
        inline: false,
      },
      {
        name: `From`,
        value: `> ${dto.fromEns ? '🧑 ' + dto.fromEns : dto.notableFrom ? dto.from : '🧑 ' + dto.fromAddress}`,
        inline: false,
      },
    )

  messageEmbeds.push(embed)
  return messageEmbeds
}
