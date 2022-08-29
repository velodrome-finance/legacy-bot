export type TransferDto = BaseDto & {
  amount: number
  value: number
}

export type DepositWithdrawDto = BaseDto & {
  token0Amount: number
  token0Symbol: string
  token0Value: number
  token1Amount: number
  token1Value: number
  token1Symbol: string
  isDeposit: boolean
  totalValue: number
  imageUrl: string
  img64: string
}

export type BaseDto = {
  from: string
  to: string
  fromAddress: string
  toAddress: string
  fromEns: string
  toEns: string
  transactionHash: string
  timestamp: Date
  blockNumber: number
  notableTo: boolean
  notableFrom: boolean
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
  totalValue: number
}
