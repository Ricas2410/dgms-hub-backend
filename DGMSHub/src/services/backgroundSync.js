import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import apiService from './apiService';
import offlineService from './offlineService';

class BackgroundSyncService {
  constructor() {
    this.syncInterval = null;
    this.isOnline = true;
    this.isSyncing = false;
    this.syncIntervalMs = 5 * 60 * 1000; // 5 minutes
    this.lastSyncTime = null;
    this.syncListeners = [];
    
    this.init();
  }

  init() {
    this.setupNetworkListener();
    this.setupAppStateListener();
    this.startPeriodicSync();
  }

  // Setup network connectivity listener
  setupNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected;
      
      console.log(`Network status changed: ${this.isOnline ? 'Online' : 'Offline'}`);
      
      // If we just came back online, trigger immediate sync
      if (wasOffline && this.isOnline) {
        console.log('Network restored - triggering sync');
        this.triggerSync();
      }
      
      // Notify listeners
      this.notifyListeners('networkChange', { isOnline: this.isOnline });
    });
  }

  // Setup app state listener
  setupAppStateListener() {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && this.isOnline) {
        // App became active and we're online - check if we need to sync
        this.checkAndSync();
      }
    });
  }

  // Start periodic sync when online
  startPeriodicSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.isSyncing) {
        this.triggerSync();
      }
    }, this.syncIntervalMs);
  }

  // Check if sync is needed and trigger if necessary
  async checkAndSync() {
    try {
      if (!this.isOnline || this.isSyncing) return;

      const lastSync = await offlineService.getLastSyncTime();
      const now = new Date();
      
      // Sync if no previous sync or last sync was more than 10 minutes ago
      if (!lastSync || (now - lastSync) > 10 * 60 * 1000) {
        console.log('Sync needed - triggering background sync');
        this.triggerSync();
      }
    } catch (error) {
      console.error('Error checking sync status:', error);
    }
  }

  // Trigger sync operation
  async triggerSync() {
    if (this.isSyncing || !this.isOnline) {
      console.log('Sync already in progress or offline');
      return;
    }

    this.isSyncing = true;
    this.notifyListeners('syncStart');

    try {
      console.log('🔄 Starting background sync...');
      
      // Sync applications data
      const result = await apiService.syncWithServer();
      
      if (result.success) {
        this.lastSyncTime = new Date();
        console.log('✅ Background sync completed successfully');
        
        this.notifyListeners('syncSuccess', {
          timestamp: this.lastSyncTime,
          message: 'Data synchronized successfully'
        });
      } else {
        throw new Error(result.message || 'Sync failed');
      }
    } catch (error) {
      console.error('❌ Background sync failed:', error);
      
      this.notifyListeners('syncError', {
        error: error.message,
        timestamp: new Date()
      });
    } finally {
      this.isSyncing = false;
    }
  }

  // Force immediate sync
  async forceSync() {
    if (!this.isOnline) {
      throw new Error('Cannot sync while offline');
    }

    // Stop current sync if running
    this.isSyncing = false;
    
    // Trigger new sync
    await this.triggerSync();
  }

  // Add sync listener
  addSyncListener(listener) {
    this.syncListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.syncListeners.indexOf(listener);
      if (index > -1) {
        this.syncListeners.splice(index, 1);
      }
    };
  }

  // Notify all listeners
  notifyListeners(event, data = {}) {
    this.syncListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  }

  // Get sync status
  getSyncStatus() {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      lastSyncTime: this.lastSyncTime,
      syncInterval: this.syncIntervalMs
    };
  }

  // Update sync interval
  setSyncInterval(intervalMs) {
    this.syncIntervalMs = intervalMs;
    this.startPeriodicSync();
    console.log(`Sync interval updated to ${intervalMs / 1000} seconds`);
  }

  // Preload content for offline use
  async preloadContent() {
    try {
      if (!this.isOnline) {
        console.log('Cannot preload content while offline');
        return;
      }

      console.log('🔄 Preloading content for offline use...');
      
      // Get applications data
      const response = await apiService.getApplications(true);
      
      if (response.success && response.data.applications) {
        const apps = response.data.applications;
        
        // Cache icons in background
        await this.preloadIcons(apps);
        
        console.log(`✅ Preloaded content for ${apps.length} applications`);
        
        this.notifyListeners('preloadComplete', {
          appsCount: apps.length,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('❌ Error preloading content:', error);
      this.notifyListeners('preloadError', { error: error.message });
    }
  }

  // Preload icons for applications
  async preloadIcons(applications) {
    const iconPromises = applications.map(async (app) => {
      if (app.iconUrl && app.iconUrl.startsWith('http')) {
        try {
          // This will be handled by the offline service
          console.log(`Preloading icon for ${app.name}`);
        } catch (error) {
          console.error(`Error preloading icon for ${app.name}:`, error);
        }
      }
    });

    await Promise.all(iconPromises);
  }

  // Clean up resources
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.syncListeners = [];
    console.log('Background sync service destroyed');
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const cacheSize = await offlineService.getCacheSize();
      const applications = await offlineService.getApplications();
      const lastSync = await offlineService.getLastSyncTime();
      
      return {
        cacheSize: offlineService.formatSize(cacheSize),
        cachedAppsCount: applications.length,
        lastSync,
        isDataStale: await offlineService.isDataStale()
      };
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return {
        cacheSize: '0 B',
        cachedAppsCount: 0,
        lastSync: null,
        isDataStale: true
      };
    }
  }

  // Clear all cached data
  async clearCache() {
    try {
      await offlineService.clearCache();
      this.lastSyncTime = null;
      
      this.notifyListeners('cacheCleared', {
        timestamp: new Date()
      });
      
      console.log('✅ Cache cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing cache:', error);
      return false;
    }
  }
}

export default new BackgroundSyncService();
