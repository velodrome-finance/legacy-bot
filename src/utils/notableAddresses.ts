import { NotableAddresses } from '../constants/addresses'

export function GetNotableAddress(traderAddress: string | undefined): string {
  if (traderAddress == undefined) {
    return ''
  }

  const found = NotableAddresses[traderAddress.toLowerCase()]

  if (found) {
    return found
  }

  return ''
}
