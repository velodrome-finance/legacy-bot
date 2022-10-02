export async function PriceToken(token: (string | number)[], address: string) {
  if ((token[0] as string) != '') {
    return TOKEN_PRICES[token[0]] as unknown as number
  }

  let price = 0

  for (let i = 0; i < VELO_DATA.length; i++) {
    const pair = VELO_DATA[i]

    if (pair.token0_address.toLowerCase() === address) {
      if (pair.token0?.price) {
        price = pair.token0?.price
        break
      }
    }

    if (pair.token1_address.toLowerCase() === address) {
      if (pair.token1?.price) {
        price = pair.token1?.price
        break
      }
    }
  }

  return price
}
