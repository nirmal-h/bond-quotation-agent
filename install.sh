#!/bin/bash

echo "🚀 Setting up Bond Quotation Agent..."
echo "====================================="

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Installing pnpm..."
    npm install -g pnpm
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo "   Node.js: $(node -v)"
echo "   pnpm: $(pnpm -v)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
pnpm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build shared package
echo ""
echo "🔨 Building shared package..."
cd packages/shared
pnpm build
cd ../..

if [ $? -ne 0 ]; then
    echo "❌ Failed to build shared package"
    exit 1
fi

echo "✅ Shared package built successfully"

# Seed RAG data
echo ""
echo "🌱 Seeding RAG data..."
cd packages/api
pnpm seed:rag
cd ../..

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed RAG data"
    exit 1
fi

echo "✅ RAG data seeded successfully"

# Build API
echo ""
echo "🔨 Building API..."
cd packages/api
pnpm build
cd ../..

if [ $? -ne 0 ]; then
    echo "❌ Failed to build API"
    exit 1
fi

echo "✅ API built successfully"

# Build web app
echo ""
echo "🔨 Building web app..."
cd apps/web
pnpm build
cd ../..

if [ $? -ne 0 ]; then
    echo "❌ Failed to build web app"
    exit 1
fi

echo "✅ Web app built successfully"

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Start development: pnpm dev"
echo "   2. Frontend: http://localhost:4200"
echo "   3. Backend: http://localhost:3001"
echo "   4. Run tests: pnpm test"
echo "   5. Run e2e: pnpm e2e"
echo ""
echo "📚 Documentation: README.md"
echo "🐛 Issues: Check the README for troubleshooting" 