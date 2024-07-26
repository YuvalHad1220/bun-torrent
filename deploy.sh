#!/bin/bash

# Exit if any command fails
set -e

# Build the Vite project
echo "Building Vite project..."
cd frontend
bun i
bun run build

# Move back to the root directory
cd ..

# Start Docker Compose
echo "Starting Docker Compose..."
docker-compose up --build