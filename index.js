const { execSync, spawn } = require('child_process');
const time = Date.now();

try {
    console.log('Pulling latest changes from GitHub...');
    execSync('git pull origin main', { stdio: 'inherit' });
    console.log('Successfully updated from GitHub!\n');
} catch (error) {
    console.log(`Could not pull from GitHub ${error}`);
    console.log('Continuing with existing files...\n');
}

try {
    console.log('Installing dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    console.log('Dependencies installed!\n');
} catch (error) {
    console.log('Error installing dependencies');
    console.error(error.message);
}

console.log('Starting bot...');

const bot = spawn('node', ['src/index.js'], { stdio: 'inherit' });

bot.on('spawn', () => {
    const timeInSeconds = ((Date.now() - time) / 1000).toFixed(1);
    console.log(`Bot started successfully, it took ${timeInSeconds}s to start.`);
});

bot.on('error', (error) => {
    console.error(`Error starting bot: ${error.message}`);
});

bot.on('exit', (code) => {
    if (code !== 0) {
        console.log(`Bot exited with code ${code}`);
    }
    process.exit(code);
});

