import { MessageEmbed } from 'discord.js'
import { staticIcons } from '../constants/staticIcons'
import { SwapDto } from '../types/dtos'
import { EtherScanTransactionLink, FN, FormattedDateTime } from './common'

export function SwapTwitter(dto: SwapDto) {
  const post: string[] = []

  if (dto.amount0In > 0) {
    Line1(dto.amount0InValue, dto.to, post)
    Line2(dto.amount0In, dto.token0Symbol, dto.amount0InValue, post)
    Line3(dto.amount1Out, dto.token1Symbol, dto.amount1OutValue, post)
  } else {
    Line1(dto.amount1InValue, dto.to, post)
    Line2(dto.amount1In, dto.token1Symbol, dto.amount1InValue, post)
    Line3(dto.amount0Out, dto.token0Symbol, dto.amount0OutValue, post)
  }
  post.push(`${dto.fromEns ? dto.fromEns : dto.notableFrom ? dto.from : '🧑 ' + dto.fromAddress}\n`)
  post.push(`🔗 ${EtherScanTransactionLink(dto.transactionHash)}\n\n`)
  post.push(`Trade and earn on Velodrome today 👇\n`)
  post.push(`https://app.velodrome.finance`)
  return post.join('')
}

function Line1(amountInValue: number, to: string, post: string[]) {
  post.push(`$${FN(amountInValue, 2)} swap via ${to}\n\n`)
}

function Line2(amountInAmount: number, tokenSymbol: string, amountInValue: number, post: string[]) {
  post.push(`🔹 ${FN(amountInAmount, 2)} $${tokenSymbol} ($${FN(amountInValue, 2)}) to \n`)
}

function Line3(amountInAmount: number, tokenSymbol: string, amountInValue: number, post: string[]) {
  post.push(`🔸 ${FN(amountInAmount, 2)} $${tokenSymbol} ($${FN(amountInValue, 2)})\n\n`)
}

export function SwapDiscord(dto: SwapDto): MessageEmbed[] {
  const messageEmbeds: MessageEmbed[] = []
  const embed = new MessageEmbed()
    .setColor('#00ff7f')
    .setURL(`${`https://optimistic.etherscan.io/tx/${dto.transactionHash}`}`)
    .setFooter({
      iconURL: staticIcons.velodromeIconSmall,
      text: `Velodrome`,
    })
    .setTimestamp()
    .setThumbnail('attachment://buffer.png')
  if (dto.amount0In > 0) {
    title(dto.amount0InValue, dto.token0Symbol, dto.token1Symbol, embed)
    discord1(dto.amount0In, dto.token0Symbol, dto.amount0InValue, embed)
    discord2(dto.amount1Out, dto.token1Symbol, dto.amount1OutValue, embed)
  } else {
    title(dto.amount1InValue, dto.token0Symbol, dto.token1Symbol, embed)
    discord1(dto.amount1In, dto.token1Symbol, dto.amount1InValue, embed)
    discord2(dto.amount0Out, dto.token0Symbol, dto.amount0OutValue, embed)
  }
  messageEmbeds.push(embed)
  return messageEmbeds
}

function title(amountInValue: number, token0Symbol: string, token1Symbol: string, embed: MessageEmbed) {
  embed.setTitle(`$${FN(amountInValue, 2)} ${token0Symbol}/${token1Symbol} Swap`)
}

function discord1(amountInAmount: number, tokenSymbol: string, amountInValue: number, embed: MessageEmbed) {
  embed.addField(`From`, `> 🔹 ${FN(amountInAmount, 2)} $${tokenSymbol} ($${FN(amountInValue, 2)})`, false)
}
function discord2(amountInAmount: number, tokenSymbol: string, amountInValue: number, embed: MessageEmbed) {
  embed.addField(`To`, `> 🔸 ${FN(amountInAmount, 2)} $${tokenSymbol} ($${FN(amountInValue, 2)})`, false)
}
