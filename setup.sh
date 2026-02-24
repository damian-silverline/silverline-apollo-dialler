#!/bin/bash

# Silverline Apollo Dialer - Setup Script

echo "🚀 Silverline Apollo Dialer - Setup Script"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Create .env files if they don't exist
echo ""
echo "📝 Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env..."
    cp backend/.env.example backend/.env
    echo "⚠️  Please edit backend/.env with your credentials"
fi

if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env..."
    cp frontend/.env.example frontend/.env
    echo "⚠️  Please edit frontend/.env with your credentials"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."

echo "Installing backend dependencies..."
cd backend
npm install --legacy-peer-deps
cd ..

echo "Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps
cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your Google OAuth credentials"
echo "2. Edit frontend/.env with your Google Client ID"
echo "3. Run: npm run dev:all (or run both services manually)"
echo ""
echo "For detailed setup instructions, see SETUP.md"
