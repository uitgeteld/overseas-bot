# 🌊 Overseas Bot

A fun and feature-rich Discord bot built with TypeScript and Discord.js v14, designed to make server management easier and more enjoyable.

## ✨ Features

### 🐈‍⬛ Git Integration
- **Browse Commits** - View commit history from any GitHub repository
- **Commit Details** - Inspect file changes, additions/deletions, and diffs with syntax highlighting
- **User Profiles** - Explore GitHub user profiles and their repositories
- **README Viewer** - Display repository README files directly in Discord

### ⚙️ Settings & Management
- **Auto-Update** - Automatically pull latest changes from GitHub on restart
- **Configurable Options** - Toggle git pull and npm install features on/off
- **Persistent Settings** - Options saved to JSON and survive bot restarts

### 🛠️ Utilities
- **User Info** - Display detailed user information including roles, avatars, and banners
- **Help Command** - Organized command list with emoji categories
- **Ping Command** - Check bot latency and responsiveness

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- A Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))
- A GitHub Personal Access Token (optional, for higher API rate limits)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/uitgeteld/overseas-bot.git
   cd overseas-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   TOKEN=your_discord_bot_token
   CLIENT_ID=your_bot_application_id
   GITHUB_TOKEN=your_github_token
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

## 💻 Development

### Running in Development Mode
```bash
npm run dev
```

This uses `tsx watch` to automatically restart the bot when you make changes.

### Project Structure
```
overseas-bot/
├── src/
│   ├── commands/        # Slash commands
│   │   ├── git/        # Git-related commands
│   │   ├── settings/   # Bot configuration commands
│   │   └── util/       # Utility commands
│   ├── events/         # Discord event handlers
│   ├── functions/      # Command and event loaders
│   ├── helpers/        # Utility functions
│   ├── types/          # TypeScript type definitions
│   ├── config.ts       # Configuration loader
│   └── index.ts        # Main entry point
├── dist/               # Compiled JavaScript (generated)
├── startOptions.json   # Bot runtime options
└── package.json
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start bot in development mode with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled bot (auto-updates from git first) |

## 🎮 Commands

### Git Commands
- `/git [repo]` - Browse commits from a repository or GitHub user
- `/repo [repo/user]` - View repository README or user's pinned repos

### Utility Commands
- `/help` - Display all available commands organized by category
- `/ping` - Check bot response time
- `/user [target]` - View detailed information about a Discord user

### Settings Commands (Developer Only)
- `/options` - Toggle auto-pull and npm install features

## 🔧 Configuration

### Start Options
The bot uses `startOptions.json` to control startup behavior:
```json
{
  "gitPull": true,
  "npmInstall": true
}
```

These can be toggled via the `/options` command and persist across restarts.

## 📝 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**uitgeteld**
- GitHub: [@uitgeteld](https://github.com/uitgeteld)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/uitgeteld/overseas-bot/issues).

## ⭐ Show Your Support

Give a ⭐️ if this project helped you!

---

*Built with ❤️ using [Discord.js](https://discord.js.org/) and [TypeScript](https://www.typescriptlang.org/)*
