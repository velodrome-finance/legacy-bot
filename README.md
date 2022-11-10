# Velodrome Bot Bribes | Deposits | Trades 🚴

Run locally:

```
yarn install
yarn start
```

### Environment Variables

- `TESTNET` - true/false (if true prints to console, doesn't post)
- `INFURA_ID` - used to get ENS
- `INFURA_ID_OPTIMISM` - for everything else

### Integrations

#### Discord

- `DISCORD_ENABLED` - enable/disable posting to discord
- `DISCORD_ACCESS_TOKEN`
- `DISCORD_CHANNEL_SWAP` - channel to post swaps eg. 🔁-swaps
- `DISCORD_CHANNEL_DEPOSIT` - channel to post deposits eg. 📩-deposits
- `DISCORD_CHANNEL_BRIBE` - channel to post bribes eg. 💰-bribes

#### Twitter

- `TWITTER_ENABLED`
- `TWITTER_APP_KEY`
- `TWITTER_APP_SECRET`
- `TWITTER_ACCESS_TOKEN`
- `TWITTER_ACCESS_SECRET`

#### Telegram

- `TELEGRAM_ENABLED` - not used atm
- `TELEGRAM_ACCESS_TOKEN` - not used atm
- `TELEGRAM_CHANNEL` - not used atm

#### Telegram Logging

Log when the bot is launched or goes down.

- `LOG_TOKEN`
- `LOG_CHANNEL`
