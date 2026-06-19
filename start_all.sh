#!/bin/bash

# Kill any existing processes running on the ports to avoid "Address already in use" errors
lsof -ti:8000 | xargs kill -9 2>/dev/null
lsof -ti:8081 | xargs kill -9 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null

echo "Starting AI Service..."
cd ai-service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
set -a
source .env
set +a
python3 app.py &
AI_PID=$!
cd ..

echo "Starting Backend..."
cd backend
set -a
source ../.env
set +a
JAVA_HOME=../jdk-17.0.2.jdk/Contents/Home ../apache-maven-3.9.6/bin/mvn spring-boot:run &
BACKEND_PID=$!
cd ..

echo "Starting Frontend..."
cd frontend
npm install
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

echo "All services are starting up!"
echo "AI Service: http://localhost:8000"
echo "Backend: http://localhost:8081"
echo "Frontend: http://localhost:5173"

# Keep script running
wait
