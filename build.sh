#!/bin/bash

# Build script for Vercel deployment
echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
npm run build

echo "Copying images to build..."
cp public/kala.png build/
cp public/home-image.jpg build/

echo "Frontend build completed successfully!"
echo "Output directory: frontend/build/"
