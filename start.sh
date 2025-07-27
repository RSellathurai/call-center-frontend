#!/bin/bash

# Call Center Dashboard Startup Script
# This script starts both the ElevenLabs API server and the Next.js frontend

echo "🚀 Starting Call Center Dashboard..."
echo ""

# Function to cleanup background processes on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $API_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Check if we're in the right directory
if [ ! -f "elevenlabs_conversations.py" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Start the API server
echo "📡 Starting ElevenLabs API Server..."
cd api
./start.sh &
API_PID=$!
cd ..

# Wait a moment for the API server to start
sleep 3

# Check if API server is running
if ! curl -s http://localhost:8000 > /dev/null; then
    echo "❌ Error: API server failed to start"
    exit 1
fi

echo "✅ API Server is running on http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""

# Start the Next.js frontend
echo "🌐 Starting Next.js Frontend..."
cd ai-agent-dashboard

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Start the development server
npm run dev &
FRONTEND_PID=$!
cd ..

# Wait a moment for the frontend to start
sleep 5

echo "✅ Frontend is running on http://localhost:3000"
echo ""
echo "🎉 Call Center Dashboard is ready!"
echo ""
echo "📊 Dashboard: http://localhost:3000"
echo "📡 API Server: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user to stop
wait 