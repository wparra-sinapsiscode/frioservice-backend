#!/bin/bash

# Build script for FrioService Backend

echo "🏗️  Building FrioService Backend..."

# Clean previous build
rm -rf dist/

# Compile TypeScript
npm run build

# Copy non-TS files if needed
# cp -r src/assets dist/ 2>/dev/null || true

echo "✅ Build completed successfully!"