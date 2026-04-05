#!/bin/bash

# --- VPS Deployment Script for PhysicsWallahApp ---
# This script installs dependencies and starts the app with PM2.

echo "🚀 Starting Deployment on VPS..."

# 1. Update and Install Core Dependencies
sudo apt update
sudo apt install -y nodejs npm git

# 2. Install PM2 Globably
sudo npm install -y pm2 -g

# 3. Create Project Directory
mkdir -p ~/pw-app
cd ~/pw-app

# 4. Note for User: 
# You need to upload the 'dist' and 'server' folders to ~/pw-app
# If you are using Git, run: git clone <your-repo-url> .

echo "📦 Installing Server Dependencies..."
cd server
npm install
cd ..

echo "⚡ Starting App with PM2..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment Complete! App running on port 5000."
echo "🔗 Access it at: http://pw.pimaxer.in:5000"
