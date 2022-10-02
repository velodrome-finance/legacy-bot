import mergeImages from 'merge-images'
import { Canvas, Image } from 'canvas'
import { staticIcons } from '../constants/staticIcons'

const coingeckoBaseUrl = 'https://assets.coingecko.com/coins/images/'

export const getMergedThumbnail = async (arg0: (string | number)[], arg1: (string | number)[]) => {
  let token0Img = `${coingeckoBaseUrl}${arg0[3] as string}`
  let token1Img = `${coingeckoBaseUrl}${arg1[3] as string}`

  if (arg0[0] === 'velodrome-finance') {
    token0Img = staticIcons.velodromeIcon
  }

  if (arg1[0] === 'velodrome-finance') {
    token1Img = staticIcons.velodromeIcon
  }

  if (arg0[0] === 'optimism') {
    token0Img = staticIcons.optimismIcon
  }

  if (arg1[0] === 'optimism') {
    token1Img = staticIcons.optimismIcon
  }

  if ((arg0[3] as string).startsWith('https')) {
    token0Img = arg0[3] as string
  }

  if ((arg1[3] as string).startsWith('https')) {
    token1Img = arg1[3] as string
  }

  const b64 = await mergeImages(
    [
      { src: token1Img, x: 40, y: 0 },
      { src: token0Img, x: 0, y: 0 },
    ],
    { width: 100, height: 55, Canvas: Canvas, Image: Image },
  )
  const b64StrippedHeader = b64.split(';base64,').pop()
  return b64StrippedHeader
}

export const getThumbnail = (arg0: (string | number)[]) => {
  let token0Img = `${coingeckoBaseUrl}${arg0[3] as string}`
  if (arg0[0] === 'velodrome-finance') {
    token0Img = staticIcons.velodromeIcon
  }
  if (arg0[0] === 'optimism') {
    token0Img = staticIcons.optimismIcon
  }
  return token0Img
}
