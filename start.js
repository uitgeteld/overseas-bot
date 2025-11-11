const { execSync } = require('child_process');

try {
    console.log('📥 Pulling latest changes from GitHub...');
    execSync('git pull origin main', { stdio: 'inherit' });
    console.log('✅ Successfully updated from GitHub!\n');
} catch (error) {
    console.log('⚠️  Could not pull from GitHub (this is normal on first run)');
    console.log('Continuing with existing files...\n');
}

console.log('🤖 Starting bot...');
require('./src/index.js');