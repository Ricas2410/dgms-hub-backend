import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import NetInfo from '@react-native-community/netinfo';

// Storage keys - Use original keys to preserve existing data
const STORAGE_KEYS = {
  APPLICATIONS: 'applications', // Original key
  CATEGORIES: 'categories', // Original key
  LAST_SYNC: 'last_sync', // Original key
  OFFLINE_MODE: 'offline_mode_enabled',
};

// File paths
const ICON_CACHE_DIR = `${FileSystem.documentDirectory}icon_cache/`;

class OfflineService {
  constructor() {
    this.isOnline = true;
    this.initializeCache();
    this.setupNetworkListener();
  }

  async initializeCache() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(ICON_CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(ICON_CACHE_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Error initializing cache:', error);
    }
  }

  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;
      
      if (wasOffline && this.isOnline) {
        this.triggerSync();
      }
    });
  }

  async storeApplications(applications) {
    try {
      // Only store if we have valid applications data from server
      if (!applications || applications.length === 0) {
        console.log('⚠️ No applications to store - skipping cache update');
        return false;
      }

      console.log(`📱 Storing ${applications.length} applications offline...`);

      // Store applications data
      await AsyncStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));

      // Cache icons in background
      this.cacheIcons(applications).catch(error => {
        console.error('Icon caching failed:', error);
      });

      // Update sync time
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());

      console.log('✅ Applications stored successfully for offline use');
      return true;
    } catch (error) {
      console.error('❌ Error storing applications:', error);
      return false;
    }
  }

  async getApplications() {
    try {
      console.log('📱 Loading applications from offline storage...');

      const stored = await AsyncStorage.getItem(STORAGE_KEYS.APPLICATIONS);
      if (!stored) {
        console.log('⚠️ No offline applications found');
        return [];
      }

      const applications = JSON.parse(stored);
      console.log(`✅ Found ${applications.length} cached applications`);

      // Update with local icon paths
      const appsWithLocalIcons = await Promise.all(
        applications.map(async (app) => {
          const localIcon = await this.getLocalIconPath(app.id);
          return {
            ...app,
            iconUrl: localIcon || app.iconUrl || `https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}`,
            isOffline: true,
            cachedAt: new Date().toISOString()
          };
        })
      );

      return appsWithLocalIcons;
    } catch (error) {
      console.error('❌ Error getting offline applications:', error);
      return [];
    }
  }

  async cacheIcons(applications) {
    const promises = applications.map(async (app) => {
      if (app.iconUrl && app.iconUrl.startsWith('http')) {
        try {
          const fileName = `icon_${app.id}.png`;
          const localPath = `${ICON_CACHE_DIR}${fileName}`;
          
          const fileInfo = await FileSystem.getInfoAsync(localPath);
          if (!fileInfo.exists) {
            await FileSystem.downloadAsync(app.iconUrl, localPath);
          }
        } catch (error) {
          console.error(`Error caching icon for ${app.name}:`, error);
        }
      }
    });

    await Promise.all(promises);
  }

  async getLocalIconPath(appId) {
    try {
      const fileName = `icon_${appId}.png`;
      const localPath = `${ICON_CACHE_DIR}${fileName}`;
      
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      return fileInfo.exists ? localPath : null;
    } catch (error) {
      return null;
    }
  }

  async getLastSyncTime() {
    try {
      const lastSync = await AsyncStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      return lastSync ? new Date(lastSync) : null;
    } catch (error) {
      return null;
    }
  }

  async isDataStale() {
    const lastSync = await this.getLastSyncTime();
    if (!lastSync) return true;
    
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return lastSync < oneHourAgo;
  }

  async clearCache() {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.APPLICATIONS,
        STORAGE_KEYS.CATEGORIES,
        STORAGE_KEYS.LAST_SYNC
      ]);

      const dirInfo = await FileSystem.getInfoAsync(ICON_CACHE_DIR);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(ICON_CACHE_DIR);
        await FileSystem.makeDirectoryAsync(ICON_CACHE_DIR, { intermediates: true });
      }

      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  async getCacheSize() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(ICON_CACHE_DIR);
      if (!dirInfo.exists) return 0;

      const files = await FileSystem.readDirectoryAsync(ICON_CACHE_DIR);
      let totalSize = 0;

      for (const file of files) {
        const fileInfo = await FileSystem.getInfoAsync(`${ICON_CACHE_DIR}${file}`);
        totalSize += fileInfo.size || 0;
      }

      return totalSize;
    } catch (error) {
      return 0;
    }
  }

  formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  triggerSync() {
    // This will be called by the main app
    console.log('Network restored - ready to sync');
  }
}

export default new OfflineService();
