@echo off
REM Campus Nexus - Complete Setup
REM This script will:
REM 1. Setup database tables
REM 2. Configure migrations
REM 3. Report status

echo.
echo ========================================================================
echo Campus Nexus - Complete Database Setup
echo ========================================================================
echo.

cd /d "c:\Users\thanu\Documents\Projects\Campus-Nexus\backend" || (
  echo ERROR: Could not navigate to backend directory
  pause
  exit /b 1
)

echo Running setup script...
echo.

node complete-setup.js

if %errorlevel% neq 0 (
  echo.
  echo ERROR: Setup failed with code %errorlevel%
  pause
  exit /b %errorlevel%
)

echo.
echo ========================================================================
echo SETUP COMPLETED
echo ========================================================================
echo.
echo Next: Restart your backend server and refresh the browser
echo.
pause
