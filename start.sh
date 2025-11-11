#!/bin/bash

START_TIME=$(date +%s%3N)

echo "Pulling latest changes from GitHub..."
if git pull origin main; then
    echo "✅ Successfully updated from GitHub!"
    echo ""
else
    echo "Could not pull from GitHub (this is normal on first run)"
    echo "Continuing with existing files..."
    echo ""
fi

echo "Installing dependencies..."
if npm install; then
    echo "Dependencies installed!"
    echo ""
else
    echo "Error installing dependencies"
fi

echo "Starting bot..."
node src/index.js

END_TIME=$(date +%s%3N)
DURATION=$(echo "scale=1; ($END_TIME - $START_TIME) / 1000" | bc)
echo "Bot started successfully, it took ${DURATION}s to start."
