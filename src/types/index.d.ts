/* eslint-disable no-var */

import { Pair } from './velo'

declare global {
  var ENS: { [key: string]: string } = {}
  var PRICE: number
  var TOKEN_PRICES: { [key: string]: string } = {}
  var TOKEN_IMAGES: { [key: string]: string } = {}
  var VELO_DATA: Pair[]
  var BRIBE_ADDRESSES: string[]
}

export {}
