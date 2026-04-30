#!/usr/bin/env bash
# TenderFlow Guinea — Development Environment Startup Script

set -e

echo "🚀 Starting TenderFlow Guinea development environment..."
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check for .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${YELLOW}   Please edit .env with your configuration before continuing.${NC}"
    echo ""
fi

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Docker
if command_exists docker; then
    echo -e "${GREEN}✓${NC} Docker found"
else
    echo -e "${RED}✗${NC} Docker not found. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if docker compose version >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Docker Compose found"
else
    echo -e "${RED}✗${NC} Docker Compose not found. Please install Docker Compose."
    exit 1
fi

echo ""
echo "Starting services..."
echo ""

# Start infrastructure services first
docker compose up -d db redis minio

echo "Waiting for database to be ready..."
sleep 5

# Start API
docker compose up -d api

echo "Running database migrations..."
docker compose exec api alembic upgrade head 2>/dev/null || echo "Note: Run migrations manually if needed"

# Start workers
docker compose up -d worker scheduler

# Start web
docker compose up -d web

# Start nginx
docker compose up -d nginx

echo ""
echo -e "${GREEN}✅ All services started!${NC}"
echo ""
echo "Services:"
echo "  🌐 Frontend:      http://localhost:3000"
echo "  📡 API:           http://localhost:8000"
echo "  📚 API Docs:      http://localhost:8000/docs"
echo "  📦 MinIO Console: http://localhost:9001"
echo "  🔴 Redis:         localhost:6379"
echo "  🐘 PostgreSQL:    localhost:5432"
echo ""
echo "Useful commands:"
echo "  docker compose logs -f api      # Follow API logs"
echo "  docker compose logs -f web      # Follow frontend logs"
echo "  docker compose logs -f worker   # Follow worker logs"
echo "  docker compose down             # Stop all services"
echo "  docker compose down -v          # Stop and remove volumes"
echo ""
echo "To load seed data:"
echo "  docker compose exec api python scripts/seed_data.py"
