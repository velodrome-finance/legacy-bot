export type VeloData = {
  data: Pair[]
}

export type Pair = {
  tvl: number
  apr: number
  address: string
  symbol: string
  decimals: number
  stable: boolean
  total_supply: number
  reserve0: number
  reserve1: number
  token0_address: string
  token1_address: string
  gauge_address: string
  isStable: boolean
  totalSupply: number
  token0: Token
  token1: Token
  gauge?: Gauge
}

export type Gauge = {
  decimals: number
  tbv: number
  apr: number
  address: string
  total_supply: number
  bribe_address: string
  fees_address: string
  wrapped_bribe_address: null | string
  reward: number
  bribeAddress: string
  feesAddress: string
  totalSupply: number
  bribes: Bribe[]
}

export type Bribe = {
  token: Token
  reward_ammount: number
  rewardAmmount: number
}

export type Token = {
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI: null | string
}
