#!/bin/bash

# ElevenLabs API Server Startup Script

echo "Starting ElevenLabs API Server..."

# Check if virtual environment exists
if [ ! -d "../venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv ../venv
fi

# Activate virtual environment
source ../venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

# Start the server
echo "Starting server on http://localhost:8000"
echo "API documentation available at http://localhost:8000/docs"
echo "Press Ctrl+C to stop the server"
echo ""

uvicorn main:app --host 0.0.0.0 --port 8000 --reload 