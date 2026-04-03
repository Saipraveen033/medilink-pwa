@echo off
REM ===============================
REM NFC Reader Server Startup Script
REM Windows Batch File
REM ===============================

echo.
echo ╔════════════════════════════════════════╗
echo ║   🔗 NFC READER SERVER STARTUP 🔗     ║
echo ╚════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed!
    echo.
    echo 📥 Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Check if npm dependencies are installed
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed!
    echo.
)

REM Start the server
echo 🚀 Starting NFC Server...
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
node server.js
REM The script will keep running while the server is active
REM Press Ctrl+C to stop the server
