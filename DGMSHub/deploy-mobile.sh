#!/bin/bash

echo ""
echo "========================================"
echo "   DGMS Hub Mobile App Deployment"
echo "========================================"
echo ""

echo "Choose deployment type:"
echo ""
echo "1. Preview Build (Your current method - APK for testing)"
echo "2. Optimized Build (Recommended - Smaller size, better performance)"
echo "3. Quick Update (Over-the-air update - No rebuild needed)"
echo "4. Production Build (For Play Store submission)"
echo "5. Submit to Play Store"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "🔄 Building preview APK..."
        echo "This is your current method - works perfectly!"
        npx eas build --platform android --profile preview
        ;;
    2)
        echo ""
        echo "🔄 Building optimized APK..."
        echo "This will create a smaller, faster app!"
        npx eas build --platform android --profile optimized
        ;;
    3)
        echo ""
        echo "🔄 Publishing quick update..."
        echo "Users will get this update instantly!"
        npx eas update --auto
        ;;
    4)
        echo ""
        echo "🔄 Building production AAB for Play Store..."
        npx eas build --platform android --profile production
        ;;
    5)
        echo ""
        echo "🔄 Submitting to Play Store..."
        npx eas submit --platform android
        ;;
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment process completed!"
echo ""
echo "📱 Check your Expo dashboard for build status:"
echo "https://expo.dev/accounts/your-account/projects/dgms-hub"
echo ""
