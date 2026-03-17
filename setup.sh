#!/bin/bash

# Exit on error
set -e

echo "🚀 Starting SafeWay project setup..."

# 1. Install Node dependencies (Orchestrator & Frontend)
echo "📦 Installing Node dependencies..."
npm install
cd orchestrator && npm install && cd ..
cd frontend && npm install && cd ..

# 2. Setup Python Virtual Environment in logic-server
echo "🐍 Setting up Python Virtual Environment..."
cd logic-server

# Force use of Homebrew Python 3.13 if available, otherwise fallback to python3
PYTHON_EXE=$(which /opt/homebrew/bin/python3 || which python3)
$PYTHON_EXE -m venv venv

# Activate venv
source venv/bin/activate

# 3. Install Python packages
echo "📥 Installing Python requirements..."
# Ensure pip is up to date
pip install --upgrade pip
pip install fastapi uvicorn numpy pydantic pydantic-settings

echo "✅ Setup complete!"
echo "------------------------------------------------"
echo "To start developing:"
echo "1. Terminal 1 (Logic): cd logic-server && source venv/bin/activate && uvicorn solver:app --reload"
echo "2. Terminal 2 (Node): cd orchestrator && npm run dev"
echo "3. Terminal 3 (Vite): cd frontend && npm run dev"