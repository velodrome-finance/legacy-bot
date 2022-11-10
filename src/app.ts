import { Telegraf } from 'telegraf'
import { goBot } from './bot'
import { PostTelegram } from './integrations/telegram'
import { LOG_CHANNEL, LOG_TOKEN } from './secrets'

async function Initialize(): Promise<void> {
  try {
    RegisterShutdownEvents()
    await Notifier(false)
    await goBot()
  } catch (error) {
    console.error(error)
  }
}

async function Notifier(isDown = true) {
  await PostTelegram(`🚴 Velo Bot ${isDown ? 'Down' : 'Up'}\n`, new Telegraf(LOG_TOKEN), LOG_CHANNEL)
}

function RegisterShutdownEvents(): void {
  process.on('beforeExit', async (code) => {
    await Notifier()
    process.exit(code)
  })
}

Initialize()
