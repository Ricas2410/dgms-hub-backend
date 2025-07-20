// Emergency Data Recovery Script
// This will help restore your applications data

import AsyncStorage from '@react-native-async-storage/async-storage';

const recoverData = async () => {
  console.log('🚨 Starting data recovery...');
  
  try {
    // Check all possible storage keys that might contain your data
    const possibleKeys = [
      'applications',
      'dgms_applications', 
      'offline_applications',
      'cached_applications',
      'stored_applications'
    ];
    
    console.log('🔍 Checking all storage locations...');
    
    for (const key of possibleKeys) {
      try {
        const data = await AsyncStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log(`✅ Found ${parsed.length} applications in key: ${key}`);
            console.log('📋 Applications found:');
            parsed.forEach((app, index) => {
              console.log(`  ${index + 1}. ${app.name} - ${app.url}`);
            });
            
            // If this looks like your real data, restore it to the correct location
            if (parsed.some(app => app.name && app.url && !app.name.includes('Test'))) {
              console.log(`🔄 Restoring data from ${key} to main storage...`);
              await AsyncStorage.setItem('applications', JSON.stringify(parsed));
              console.log('✅ Data restored successfully!');
              return parsed;
            }
          }
        }
      } catch (error) {
        console.log(`❌ Error checking key ${key}:`, error.message);
      }
    }
    
    console.log('⚠️ No recoverable data found in storage');
    return null;
    
  } catch (error) {
    console.error('❌ Recovery failed:', error);
    return null;
  }
};

const clearBadData = async () => {
  console.log('🧹 Clearing potentially corrupted cache...');
  
  try {
    // Clear the new storage keys that might have bad data
    await AsyncStorage.multiRemove([
      'dgms_applications',
      'dgms_categories', 
      'dgms_last_sync',
      'offline_applications',
      'offline_categories'
    ]);
    
    console.log('✅ Cleared potentially corrupted cache');
    return true;
  } catch (error) {
    console.error('❌ Error clearing cache:', error);
    return false;
  }
};

const showAllStorageData = async () => {
  console.log('📋 Showing all AsyncStorage data...');
  
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log(`Found ${keys.length} storage keys:`);
    
    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              console.log(`📱 ${key}: Array with ${parsed.length} items`);
              if (parsed.length > 0 && parsed[0].name) {
                console.log(`   First item: ${parsed[0].name}`);
              }
            } else if (typeof parsed === 'object') {
              console.log(`📦 ${key}: Object with keys: ${Object.keys(parsed).join(', ')}`);
            } else {
              console.log(`📄 ${key}: ${typeof parsed} - ${String(parsed).substring(0, 50)}...`);
            }
          } catch {
            console.log(`📄 ${key}: String - ${value.substring(0, 50)}...`);
          }
        }
      } catch (error) {
        console.log(`❌ Error reading ${key}:`, error.message);
      }
    }
  } catch (error) {
    console.error('❌ Error showing storage data:', error);
  }
};

// Export functions for use in app
export { recoverData, clearBadData, showAllStorageData };

// If running directly, show all data
if (require.main === module) {
  showAllStorageData();
}
