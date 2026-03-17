@echo off
REM Campus Nexus - Faculty Leave Management System Setup Script (Windows)
REM This script initializes the database and runs all necessary migrations

echo =====================================
echo Campus Nexus - Database Setup
echo =====================================
echo.

REM Check if .env exists
if not exist .env (
  echo x Error: .env file not found
  echo Please create a .env file with the following:
  echo   MYSQL_HOST=localhost
  echo   MYSQL_PORT=3306
  echo   MYSQL_USER=root
  echo   MYSQL_PASSWORD=your_password
  echo   MYSQL_DATABASE=eduvertex
  exit /b 1
)

echo o Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
  echo x Failed to install dependencies
  exit /b 1
)
echo + Dependencies installed

echo.
echo o Step 2: Initializing database tables...
node init-db.js
if %errorlevel% neq 0 (
  echo x Failed to initialize database
  exit /b 1
)
echo + Database tables initialized

echo.
echo o Step 3: Running migrations...
node run-migration.js
if %errorlevel% neq 0 (
  echo x Failed to run migrations
  exit /b 1
)
echo + Migrations completed

echo.
echo =====================================
echo + Setup completed successfully!
echo =====================================
echo.
echo You can now start the server with:
echo   npm start
echo.
pause
