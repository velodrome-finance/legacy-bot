import { EventType } from '../constants/eventType'

export type BaseEvent = {
  value: number
  eventType: EventType
  transactionHash: string
  timestamp: Date
  blockNumber: number
}

export type BaseDto = BaseEvent & {
  from: string
  to: string
  fromAddress: string
  toAddress: string
  fromEns: string
  toEns: string
  notableTo: boolean
  notableFrom: boolean
}

export type DepositDto = BaseDto & {
  token0Amount: number
  token0Symbol: string
  token0Value: number
  token1Amount: number
  token1Value: number
  token1Symbol: string
  isDeposit: boolean
  imageUrl: string
  img64: string
}

export type SwapDto = BaseDto & {
  token0Symbol: string
  token1Symbol: string
  amount0In: number
  amount0InValue: number
  amount1In: number
  amount1InValue: number
  amount0Out: number
  amount0OutValue: number
  amount1Out: number
  amount1OutValue: number
  imageUrl: string
  img64: string
}

export type BribeDto = BaseEvent & {
  from: string
  fromAddress: string
  fromEns: string
  notableFrom: boolean
  toAddress: string
  token0Symbol: string
  token1Symbol: string
  img64: string
  amount: number
}
