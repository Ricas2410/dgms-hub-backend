@echo off
echo Deploying hardcoded DGMS applications...
cd /d "C:\Users\dgms\Documents\augment-projects\DGMS HUB\backend"
git add test-server.js
git commit -m "Add hardcoded DGMS applications - Always available!"
git push origin main
echo Deployment complete!
pause
