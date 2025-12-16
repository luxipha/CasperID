#!/bin/bash

# CasperID Setup Script
# Automated setup for testing

echo "🚀 CasperID Setup Script"
echo "========================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
  NODE_VERSION=$(node --version)
  echo "✓ Node.js $NODE_VERSION"
else
  echo "✗ Node.js not found. Please install Node.js v18+"
  exit 1
fi

# MongoDB Atlas (cloud) - no local installation needed
echo "✓ Using MongoDB Atlas (cloud database)"

echo ""
echo "Setting up backend..."

# Navigate to server directory
cd server

# Check if .env exists
if [ ! -f .env ]; then
  echo "Creating .env file..."
  cat > .env << EOF
PORT=3001
NODE_ENV=development
MONGODB_URI=REMOVED_MONGODB_URI"✓ Created .env file"
else
  echo "✓ .env file already exists"
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing backend dependencies..."
  npm install
else
  echo "✓ Backend dependencies already installed"
fi

cd ..

echo ""
echo "Setting up frontend..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo "Creating .env.local file..."
  cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
EOF
  echo "✓ Created .env.local file"
else
  echo "✓ .env.local file already exists"
fi

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
else
  echo "✓ Frontend dependencies already installed"
fi

echo ""
echo "========================"
echo "✅ Setup complete!"
echo "========================"
echo ""
echo "Next steps:"
echo "1. Start backend:  cd server && npm run dev"
echo "2. Start frontend: npm run dev"
echo "3. Run tests:      cd server && ./test-api.sh"
echo ""
