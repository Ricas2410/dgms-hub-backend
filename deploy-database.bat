@echo off
echo.
echo ========================================
echo   DGMS Hub Database Deployment Script
echo ========================================
echo.

echo 🔍 Checking current directory...
cd /d "C:\Users\dgms\Documents\augment-projects\DGMS HUB\backend"
echo Current directory: %CD%

echo.
echo 📋 Files to deploy:
echo   - database-server.js (PostgreSQL backend)
echo   - setup-database.js (Database initialization)
echo   - package.json (Updated start script)
echo   - RENDER_DEPLOYMENT.md (Instructions)

echo.
echo 🔄 Adding files to git...
git add database-server.js
git add setup-database.js
git add package.json
git add RENDER_DEPLOYMENT.md
git add .env.example

echo.
echo 📝 Committing changes...
git commit -m "Add PostgreSQL database persistence - Fix data loss issue"

echo.
echo 🚀 Pushing to GitHub (auto-deploys to Render)...
git push origin main

echo.
echo ✅ Deployment initiated!
echo.
echo 📋 NEXT STEPS:
echo.
echo 1. Go to Render Dashboard: https://dashboard.render.com/
echo 2. Add PostgreSQL database:
echo    - Click "New +" → "PostgreSQL"
echo    - Name: dgms-hub-database
echo    - Plan: Free
echo    - Copy the Internal Database URL
echo.
echo 3. Update your web service environment:
echo    - Go to dgms-hub-backend service
echo    - Environment tab
echo    - Add: DATABASE_URL = [paste Internal Database URL]
echo    - Save Changes
echo.
echo 4. After deployment completes, initialize database:
echo    - Go to web service → Shell tab
echo    - Run: node setup-database.js
echo.
echo 5. Test: https://dgms-hub-backend.onrender.com/health
echo.
echo 🎉 Your applications will now persist forever!
echo.
pause
