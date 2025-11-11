const { execSync } = require('child_process');

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
require('./src/index.js');