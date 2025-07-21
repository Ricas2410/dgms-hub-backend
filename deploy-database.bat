@echo off
echo.
echo ========================================
echo   DGMS Hub Hardcoded Deployment Script
echo ========================================
echo.

echo 🔍 Checking current directory...
cd /d "C:\Users\dgms\Documents\augment-projects\DGMS HUB\backend"
echo Current directory: %CD%

echo.
echo 📋 Files to deploy:
echo   - hardcoded-server.js (Hardcoded DGMS applications)
echo   - package.json (Updated start script)

echo.
echo 🔄 Adding files to git...
git add hardcoded-server.js
git add package.json

echo.
echo 📝 Committing changes...
git commit -m "Add hardcoded DGMS applications - No database needed!"

echo.
echo 🚀 Pushing to GitHub (auto-deploys to Render)...
git push origin main

echo.
echo ✅ Deployment initiated!
echo.
echo 📋 WHAT'S INCLUDED:
echo.
echo ✅ DGMS Main Website
echo ✅ DGMS Library
echo ✅ Student Dashboard
echo ✅ Parent Portal
echo ✅ Teacher Portal
echo ✅ Non-Teaching Staff Portal
echo ✅ USchool Online
echo.
echo 🎯 BENEFITS:
echo   - No database setup needed
echo   - Core applications always available
echo   - Cannot be accidentally deleted
echo   - Additional apps can still be added
echo   - Simple and reliable
echo.
echo 🌐 Test: https://dgms-hub-backend.onrender.com/health
echo.
echo 🎉 Your DGMS applications are now hardcoded and permanent!
echo.
pause
