import { MessageEmbed } from 'discord.js'
import { staticIcons } from '../constants/staticIcons'
import { DepositWithdrawDto } from '../types/dtos'
import { EtherScanTransactionLink, FN } from './common'

export function DepositWithdrawTwitter(dto: DepositWithdrawDto) {
  const post: string[] = []
  post.push(`$${FN(dto.totalValue, 2)} deposit\n\n`)
  post.push(`${dto.toEns ? dto.toEns : dto.notableTo ? dto.to : '🧑 ' + dto.toAddress}\n`)
  post.push(`🔹 ${FN(dto.token0Amount, 2)} $${dto.token0Symbol} ($${FN(dto.token0Value, 2)})\n`)
  post.push(`🔸 ${FN(dto.token1Amount, 2)} $${dto.token1Symbol} ($${FN(dto.token1Value, 2)})\n\n`)
  if (!dto.isDeposit) {
    post.push(`from ${dto.fromEns ? dto.fromEns : dto.notableFrom ? dto.from : '🧑 ' + dto.fromAddress}\n`)
  }
  post.push(`🔗 ${EtherScanTransactionLink(dto.transactionHash)}\n\n`)
  post.push(`Trade and earn on Velodrome today 👇\n`)
  post.push(`https://app.velodrome.finance`)
  return post.join('')
}

export function DepositWithdrawDiscord(dto: DepositWithdrawDto): MessageEmbed[] {
  const messageEmbeds: MessageEmbed[] = []
  const embed = new MessageEmbed()
    .setColor('#00ff7f')
    .setURL(`${EtherScanTransactionLink(dto.transactionHash)}`)
    .setFooter({
      iconURL: staticIcons.velodromeIconSmall,
      text: `Velodrome`,
    })
    .setTimestamp()
    .setThumbnail('attachment://buffer.png')
    .setTitle(`$${FN(dto.totalValue, 2)} ${dto.token0Symbol}/${dto.token1Symbol} Deposit`)
    .addFields(
      {
        name: `$${dto.token0Symbol}`,
        value: `> 🔹 ${FN(dto.token0Amount, 2)} ($${FN(dto.token0Value, 2)})`,
        inline: false,
      },
      {
        name: `$${dto.token1Symbol}`,
        value: `> 🔸 ${FN(dto.token1Amount, 2)} ($${FN(dto.token1Value, 2)})`,
        inline: false,
      },
    )

  messageEmbeds.push(embed)
  return messageEmbeds
}
