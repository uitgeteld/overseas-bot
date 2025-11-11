const { execSync } = require('child_process');
const startTime = Date.now();

try {
    console.log('Checking for updates...');
    execSync('git fetch origin main', { stdio: 'pipe' });
    
    const changes = execSync('git log HEAD..origin/main --oneline', { encoding: 'utf-8' });
    
    if (changes.trim()) {
        console.log('\nNew commits found:');
        console.log(changes);
        
        const diffStat = execSync('git diff --stat HEAD..origin/main', { encoding: 'utf-8' });
        console.log('Files changed:');
        console.log(diffStat);
    } else {
        console.log('No updates available.\n');
    }
} catch (error) {
    console.log(`Could not check for updates ${error}\n`);
}

try {
    console.log('Pulling latest changes from GitHub...');
    execSync('git pull origin main', { stdio: 'inherit' });
    console.log('Successfully updated from GitHub!\n');
} catch (error) {
    console.log(`Could not pull from GitHub ${error}\n`);
    console.log('Continuing with existing files...\n');
}

try {
    console.log('Installing dependencies...');
    execSync('npm install --production', { stdio: 'inherit' });
    console.log('Dependencies installed!\n');
} catch (error) {
    console.log(`Error installing dependencies ${error}\n`);
}

const setupTime = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`Setup completed in ${setupTime}s\n`);

console.log('Starting bot...');
require('./src/index.js');

