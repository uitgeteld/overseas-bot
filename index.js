const { execSync } = require('child_process');
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

try {
    require('./src/index.js');
    const timeInSeconds = ((Date.now() - time) / 1000).toFixed(1);
    console.log(`Bot started successfully, it took ${timeInSeconds}s to start.`);
} catch (error) {
    console.error(`Error starting bot: ${error.message}`);
}

