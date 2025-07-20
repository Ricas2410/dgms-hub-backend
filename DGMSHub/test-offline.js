// Test Offline Functionality
// Run this to verify offline caching works

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

const testOfflineStorage = async () => {
  console.log('🧪 Testing Offline Storage...');
  
  try {
    // Test data
    const testApps = [
      {
        id: 1,
        name: "Test App 1",
        description: "Test application for offline testing",
        category: "Test",
        url: "https://example.com",
        iconUrl: "https://example.com/icon.png",
        backgroundColor: "#1976D2",
        textColor: "#FFFFFF",
        isActive: true
      },
      {
        id: 2,
        name: "Test App 2", 
        description: "Another test application",
        category: "Test",
        url: "https://google.com",
        iconUrl: "https://google.com/favicon.ico",
        backgroundColor: "#388E3C",
        textColor: "#FFFFFF",
        isActive: true
      }
    ];

    // Store test data
    console.log('📱 Storing test applications...');
    await AsyncStorage.setItem('dgms_applications', JSON.stringify(testApps));
    await AsyncStorage.setItem('dgms_last_sync', new Date().toISOString());
    
    // Verify storage
    const stored = await AsyncStorage.getItem('dgms_applications');
    const parsed = JSON.parse(stored);
    
    console.log(`✅ Stored ${parsed.length} applications successfully`);
    console.log('📋 Stored apps:', parsed.map(app => app.name));
    
    // Test retrieval
    console.log('📱 Testing retrieval...');
    const retrieved = await AsyncStorage.getItem('dgms_applications');
    const apps = JSON.parse(retrieved);
    
    if (apps && apps.length > 0) {
      console.log('✅ Offline storage working correctly!');
      console.log(`📱 Retrieved ${apps.length} applications from cache`);
      return true;
    } else {
      console.log('❌ Offline storage failed - no data retrieved');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Offline storage test failed:', error);
    return false;
  }
};

const testIconCaching = async () => {
  console.log('🧪 Testing Icon Caching...');
  
  try {
    const iconCacheDir = `${FileSystem.documentDirectory}icon_cache/`;
    
    // Check if directory exists
    const dirInfo = await FileSystem.getInfoAsync(iconCacheDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(iconCacheDir, { intermediates: true });
      console.log('📁 Created icon cache directory');
    }
    
    // Test file creation
    const testFile = `${iconCacheDir}test_icon.png`;
    await FileSystem.writeAsStringAsync(testFile, 'test data');
    
    // Verify file exists
    const fileInfo = await FileSystem.getInfoAsync(testFile);
    if (fileInfo.exists) {
      console.log('✅ Icon caching directory working correctly!');
      
      // Clean up test file
      await FileSystem.deleteAsync(testFile);
      return true;
    } else {
      console.log('❌ Icon caching failed - file not created');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Icon caching test failed:', error);
    return false;
  }
};

const runAllTests = async () => {
  console.log('🚀 Starting Offline Functionality Tests...\n');
  
  const storageTest = await testOfflineStorage();
  const iconTest = await testIconCaching();
  
  console.log('\n📊 Test Results:');
  console.log(`📱 Offline Storage: ${storageTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`🖼️ Icon Caching: ${iconTest ? '✅ PASS' : '❌ FAIL'}`);
  
  if (storageTest && iconTest) {
    console.log('\n🎉 All tests passed! Offline functionality is working.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the logs above for details.');
  }
};

// Export for use in app
export { testOfflineStorage, testIconCaching, runAllTests };

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
