import { CoinGeckoClient } from '../clients/coinGeckoClient'
import { TOKENS } from '../constants/tokenIds'

export async function GetPrices(): Promise<void> {
  try {
    const cgIDs: string[] = []

    Object.keys(TOKENS).forEach((key) => {
      if (TOKENS[key][0] != '') {
        cgIDs.push(TOKENS[key][0] as string)
      }
    })

    await CoinGeckoClient.simple.price({ ids: cgIDs, vs_currencies: 'usd' }).then((resp) => {
      console.log(resp)
      cgIDs.map((token_id) => {
        try {
          const tokenPrice = resp.data[token_id].usd
          console.log(`${token_id} Token Price: ${tokenPrice}`)
          global.TOKEN_PRICES[token_id] = tokenPrice
        } catch (e) {
          console.log(e)
        }
      })
    })
  } catch (ex) {
    console.log(ex)
  }
}
