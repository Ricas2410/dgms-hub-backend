#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function execCommand(command, description) {
  try {
    log(`\n🔄 ${description}...`, 'blue');
    execSync(command, { stdio: 'inherit' });
    log(`✅ ${description} completed`, 'green');
  } catch (error) {
    log(`❌ ${description} failed`, 'red');
    throw error;
  }
}

function checkPrerequisites() {
  log('\n📋 Checking prerequisites...', 'cyan');
  
  try {
    execSync('expo --version', { stdio: 'pipe' });
    log('✅ Expo CLI found', 'green');
  } catch (error) {
    log('❌ Expo CLI not found. Please install with: npm install -g @expo/cli', 'red');
    process.exit(1);
  }

  try {
    execSync('eas --version', { stdio: 'pipe' });
    log('✅ EAS CLI found', 'green');
  } catch (error) {
    log('❌ EAS CLI not found. Please install with: npm install -g eas-cli', 'red');
    process.exit(1);
  }

  // Check if logged in to Expo
  try {
    execSync('expo whoami', { stdio: 'pipe' });
    log('✅ Logged in to Expo', 'green');
  } catch (error) {
    log('❌ Not logged in to Expo. Please run: expo login', 'red');
    process.exit(1);
  }
}

function updateVersion() {
  log('\n📦 Updating app version...', 'cyan');
  
  const appJsonPath = path.join(__dirname, 'app.json');
  const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
  
  const currentVersion = appJson.expo.version;
  const versionParts = currentVersion.split('.').map(Number);
  versionParts[2]++; // Increment patch version
  
  const newVersion = versionParts.join('.');
  appJson.expo.version = newVersion;
  
  fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
  log(`✅ Version updated: ${currentVersion} → ${newVersion}`, 'green');
  
  return newVersion;
}

function optimizeAssets() {
  log('\n🖼️ Optimizing assets...', 'cyan');
  
  const assetsDir = path.join(__dirname, 'assets');
  if (fs.existsSync(assetsDir)) {
    // Check asset sizes
    const files = fs.readdirSync(assetsDir);
    files.forEach(file => {
      const filePath = path.join(assetsDir, file);
      const stats = fs.statSync(filePath);
      const sizeKB = Math.round(stats.size / 1024);
      
      if (sizeKB > 500) {
        log(`⚠️ Large asset detected: ${file} (${sizeKB}KB)`, 'yellow');
      }
    });
  }
  
  log('✅ Asset optimization check completed', 'green');
}

async function deployToExpo() {
  const deployType = process.argv[2] || 'update';
  
  log(`\n🚀 Starting DGMS Hub deployment (${deployType})...`, 'bright');
  
  try {
    checkPrerequisites();
    
    if (deployType === 'build' || deployType === 'full') {
      const newVersion = updateVersion();
      optimizeAssets();
      
      log('\n🔨 Building optimized app...', 'magenta');
      execCommand('eas build --platform android --profile optimized --non-interactive', 'Android build');
      
      log(`\n✅ Build completed for version ${newVersion}`, 'green');
      log('📱 APK will be available in your Expo dashboard', 'cyan');
    }
    
    if (deployType === 'update' || deployType === 'full') {
      log('\n📤 Publishing update...', 'magenta');
      execCommand('eas update --auto --non-interactive', 'Publishing update');
      
      log('\n✅ Update published successfully', 'green');
      log('📱 Users will receive the update automatically', 'cyan');
    }
    
    if (deployType === 'submit') {
      log('\n📤 Submitting to Play Store...', 'magenta');
      execCommand('eas submit --platform android --latest --non-interactive', 'Play Store submission');
      
      log('\n✅ Submitted to Play Store', 'green');
      log('📱 Check your Google Play Console for review status', 'cyan');
    }
    
    log('\n🎉 Deployment completed successfully!', 'green');
    
    // Show next steps
    log('\n📋 Next steps:', 'cyan');
    log('1. Test the app on your device', 'reset');
    log('2. Monitor crash reports in Expo dashboard', 'reset');
    log('3. Check user feedback', 'reset');
    
  } catch (error) {
    log('\n💥 Deployment failed!', 'red');
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Show usage if no arguments
if (process.argv.length < 3) {
  log('\n📱 DGMS Hub Deployment Script', 'bright');
  log('\nUsage:', 'cyan');
  log('  node deploy.js update    - Publish OTA update only', 'reset');
  log('  node deploy.js build     - Build new APK', 'reset');
  log('  node deploy.js full      - Build APK and publish update', 'reset');
  log('  node deploy.js submit    - Submit to Play Store', 'reset');
  log('\nExamples:', 'cyan');
  log('  node deploy.js update    # Quick update for bug fixes', 'reset');
  log('  node deploy.js build     # New version with native changes', 'reset');
  log('  node deploy.js full      # Complete deployment', 'reset');
  process.exit(0);
}

// Run deployment
deployToExpo();
