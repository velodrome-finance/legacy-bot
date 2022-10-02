import axios from 'axios'
import { urls } from '../constants/urls'
import { VeloData } from '../types/velo'

export const GetVeloData = async () => {
  const veloData = (await axios.get(urls.velodromeApiUrl)).data as VeloData
  global.VELO_DATA = veloData.data
  global.BRIBE_ADDRESSES = veloData.data.reduce((bribes, pair) => {
    const bribe = pair?.gauge?.wrapped_bribe_address?.toLowerCase()
    if (bribe) {
      bribes.push(bribe)
    }
    return bribes
  }, [] as string[])
  global.PAIR_ADDRESSES = veloData.data.reduce((pairs, pair) => {
    pairs.push(pair.address)
    return pairs
  }, [] as string[])
}
