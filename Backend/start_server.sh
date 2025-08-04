#!/bin/bash

# Fairmont Admin Dashboard Server Startup Script

echo "🚀 Starting Fairmont Admin Dashboard..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup first."
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Check if server is already running
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo "⚠️  Server is already running on http://localhost:8001"
    echo "📍 Admin Dashboard: http://localhost:8001/admin"
    echo "📚 API Documentation: http://localhost:8001/docs"
    exit 0
fi

# Start the server
echo "🔧 Starting server..."
nohup uvicorn main:app --host 0.0.0.0 --port 8001 > server.log 2>&1 &

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

# Check if server started successfully
if curl -s http://localhost:8001/health > /dev/null 2>&1; then
    echo "✅ Server started successfully!"
    echo ""
    echo "🎉 Fairmont Admin Dashboard is now running!"
    echo "📍 Admin Dashboard: http://localhost:8001/admin"
    echo "📚 API Documentation: http://localhost:8001/docs"
    echo "🔍 Health Check: http://localhost:8001/health"
    echo ""
    echo "👤 Admin Credentials:"
    echo "   Email: admin@fairmont.com"
    echo "   Password: FairmontAdmin123!"
    echo ""
    echo "📝 Server logs: tail -f server.log"
    echo "🛑 To stop server: pkill -f uvicorn"
else
    echo "❌ Failed to start server. Check server.log for details."
    exit 1
fi