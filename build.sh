#!/bin/bash

# Build script for Vercel deployment
# This script builds the frontend for production

echo "Installing frontend dependencies..."
cd frontend
npm install

echo "Building frontend..."
npm run build

echo "Frontend build completed successfully!"
echo "Output directory: frontend/build/"

