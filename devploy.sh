#!/bin/bash

# Enter the db folder
cd db

# Show current directory for verification
echo "Current directory: $(pwd)"

# Verify if docker-compose.yml exists
if [ ! -f "docker-compose.yml" ]; then
    echo "Error: docker-compose.yml not found in $(pwd)"
    exit 1
fi

# Stop and delete existing containers if any
echo "Stopping existing containers..."
docker compose down

# Start the database container with logs
echo "Starting containers..."
docker compose up -d

# Verify the status of the containers
echo "Containers status:"
docker compose ps

# Show logs if there are any errors
echo "Containers logs:"
docker compose logs

# Wait for the container to be ready
sleep 10

# Return to root folder
cd ..

# Enter api folder
cd api

# Copy .env.example to .env
cp .env.example .env

# Install dependencies with bun
bun install

# Return to root folder
cd ..

# Enter client folder
cd client

# Copy .env.example to .env
cp .env.example .env

# Install dependencies with npm
npm install

# Return to root folder
cd ..

cd api

# Start development server
bun run dev

echo "Installation completed successfully!"
