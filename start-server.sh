#!/bin/bash

# ===============================
# NFC Reader Server Startup Script
# macOS/Linux Bash Script
# ===============================

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   🔗 NFC READER SERVER STARTUP 🔗     ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null
then
    echo "❌ ERROR: Node.js is not installed!"
    echo ""
    echo "📥 Please install Node.js from: https://nodejs.org/"
    echo ""
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✅ Node.js found: $NODE_VERSION"
echo ""

# Check if npm dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed!"
    echo ""
fi

# Start the server
echo "🚀 Starting NFC Server..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
node server.js
# The script will keep running while the server is active
# Press Ctrl+C to stop the server
