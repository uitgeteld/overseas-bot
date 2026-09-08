# Overseas Bot

A simple Discord bot built with TypeScript and Discord.js v14.

## Features

- `/user` - info about a Discord user (roles, avatar, banner)
- `/help` - list of commands
- `/ping` - check latency

## Getting Started

### Requirements
- Node.js v18+
- A Discord bot token ([Discord Developer Portal](https://discord.com/developers/applications))

### Setup

```bash
git clone https://github.com/uitgeteld/overseas-bot.git
cd overseas-bot
npm install
```

Create a `.env` file:
```env
TOKEN=your_discord_bot_token
CLIENT_ID=your_bot_application_id
```

Then build and run:
```bash
npm run build
npm start
```

## Development

```bash
npm run dev
```

Runs with `tsx watch`, restarts automatically when you edit files.

### Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Dev mode with hot reload |
| `npm run build` | Compile TS to JS |
| `npm start` | Run the compiled bot |

## What's next

Stuff I'm planning to add or fix:

- Adding url function to play command
- Moderation

## Changelog

- Added play command (files only for now)

## License

Apache License 2.0 - see [LICENSE](LICENSE)

## Author

**uitgeteld** - [GitHub](https://github.com/uitgeteld)

## Contributing

Issues and PRs welcome, check the [issues page](https://github.com/uitgeteld/overseas-bot/issues).