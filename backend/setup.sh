#!/bin/bash

# Campus Nexus - Faculty Leave Management System Setup Script
# This script initializes the database and runs all necessary migrations

set -e  # Exit on error

echo "====================================="
echo "Campus Nexus - Database Setup"
echo "====================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found"
  echo "Please create a .env file with the following:"
  echo "  MYSQL_HOST=localhost"
  echo "  MYSQL_PORT=3306"
  echo "  MYSQL_USER=root"
  echo "  MYSQL_PASSWORD=your_password"
  echo "  MYSQL_DATABASE=eduvertex"
  exit 1
fi

echo "📦 Step 1: Installing dependencies..."
npm install
if [ $? -eq 0 ]; then
  echo "✓ Dependencies installed"
else
  echo "❌ Failed to install dependencies"
  exit 1
fi

echo ""
echo "💾 Step 2: Initializing database tables..."
node init-db.js
if [ $? -eq 0 ]; then
  echo "✓ Database tables initialized"
else
  echo "❌ Failed to initialize database"
  exit 1
fi

echo ""
echo "📝 Step 3: Running migrations..."
node run-migration.js
if [ $? -eq 0 ]; then
  echo "✓ Migrations completed"
else
  echo "❌ Failed to run migrations"
  exit 1
fi

echo ""
echo "====================================="
echo "✓ Setup completed successfully!"
echo "====================================="
echo ""
echo "You can now start the server with:"
echo "  npm start"
echo ""
