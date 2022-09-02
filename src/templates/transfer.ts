import { TOKEN_SYMBOL } from '../secrets'
import { EmbedBuilder } from 'discord.js'
import { DepositWithdrawDto, TransferDto } from '../types/dtos'
import { EtherScanTransactionLink, zapperUrl, FormattedDateTime, FN } from './common'

export function TransferTelegram(transfer: TransferDto) {
  const post: string[] = []
  post.push(
    `<a href='${EtherScanTransactionLink(transfer.transactionHash)}'>${FN(
      transfer.amount,
      2,
    )} $${TOKEN_SYMBOL}</a> ($${FN(transfer.value, 2)}) transfer \n`,
  )
  post.push(`from ${UserLink(transfer.fromEns, transfer.from, transfer.notableFrom, transfer.fromAddress)}\n`)
  post.push(`to ${UserLink(transfer.toEns, transfer.to, transfer.notableTo, transfer.toAddress)}\n`)
  return post.join('')
}

export function TransferTwitter(transfer: TransferDto) {
  const post: string[] = []
  post.push(`${FN(transfer.amount, 2)} $${TOKEN_SYMBOL} ($${FN(transfer.value, 2)}) transfer \n`)
  post.push(
    `from ${
      transfer.fromEns ? transfer.fromEns : transfer.notableFrom ? transfer.from : '🧑 ' + transfer.fromAddress
    }\n`,
  )
  post.push(`to ${transfer.toEns ? transfer.toEns : transfer.notableTo ? transfer.to : '🧑 ' + transfer.toAddress}\n`)
  post.push(`https://optimistic.etherscan.io/tx/${transfer.transactionHash}`)
  return post.join('')
}

export function UserLink(ens: string, user: string, isNotable: boolean, userAddress: string) {
  if (isNotable) {
    return user
  }
  return `<a href="${zapperUrl}${userAddress}">${ens ? ens : '🧑 ' + user}</a>`
}

export function TransferDiscord(transfer: TransferDto): EmbedBuilder[] {
  const messageEmbeds: EmbedBuilder[] = []
  const tradeEmbed = new EmbedBuilder()
    .setColor('#00ff7f')
    .setURL(`${`https://optimistic.etherscan.io/tx/${transfer.transactionHash}`}`)
    .setTitle(`$${TOKEN_SYMBOL} Transfer: ${FN(transfer.amount, 2)} $${TOKEN_SYMBOL} ($${FN(transfer.value, 2)})`)
    .addFields(
      {
        name: 'From',
        value: `${
          transfer.fromEns ? transfer.fromEns : transfer.notableFrom ? transfer.from : '🧑 ' + transfer.toAddress
        }`,
        inline: false,
      },
      {
        name: 'To',
        value: `${transfer.toEns ? transfer.toEns : transfer.notableTo ? transfer.to : '🧑 ' + transfer.toAddress}`,
        inline: false,
      },
    )
    .setFooter({ text: `${FormattedDateTime(transfer.timestamp)}` })

  messageEmbeds.push(tradeEmbed)
  return messageEmbeds
}
