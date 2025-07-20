import Constants from 'expo-constants';
import NetInfo from '@react-native-community/netinfo';
import offlineService from './offlineService';

// API Configuration
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://dgms-hub-backend.onrender.com';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async checkConnectivity() {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected;
    } catch (error) {
      return false;
    }
  }

  async fetchWithTimeout(url, options = {}, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async getApplications(forceOnline = false) {
    try {
      const isOnline = await this.checkConnectivity();

      console.log(`🌐 Network status: ${isOnline ? 'Online' : 'Offline'}`);

      // If offline and not forcing online, return cached data immediately
      if (!isOnline && !forceOnline) {
        console.log('📱 Loading from offline cache...');
        const cachedApps = await offlineService.getApplications();

        if (cachedApps.length > 0) {
          return {
            success: true,
            data: { applications: cachedApps },
            fromCache: true,
            message: `Loaded ${cachedApps.length} apps from offline cache`
          };
        } else {
          // Check if there's any data in the original storage location
          try {
            const legacyData = await AsyncStorage.getItem('applications');
            if (legacyData) {
              const legacyApps = JSON.parse(legacyData);
              console.log(`📱 Found ${legacyApps.length} apps in legacy storage`);
              return {
                success: true,
                data: { applications: legacyApps },
                fromCache: true,
                message: `Loaded ${legacyApps.length} apps from local storage`
              };
            }
          } catch (legacyError) {
            console.log('No legacy data found');
          }

          return {
            success: false,
            data: { applications: [] },
            fromCache: true,
            message: 'No offline data available. Please connect to internet to download apps.'
          };
        }
      }

      // Try to fetch from API when online
      try {
        console.log('🌐 Fetching from API...');
        const response = await this.fetchWithTimeout(`${this.baseURL}/api/applications`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // Store in cache for offline use and ensure proper icon URLs
        if (data.success && data.data.applications) {
          const appsWithIcons = data.data.applications.map(app => ({
            ...app,
            iconUrl: app.iconUrl || app.icon || `https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}`,
            isOffline: false
          }));

          // Store for offline use
          await offlineService.storeApplications(appsWithIcons);

          console.log(`✅ Loaded ${appsWithIcons.length} apps from API and cached offline`);

          // Return the enhanced data
          return {
            ...data,
            data: {
              ...data.data,
              applications: appsWithIcons
            },
            fromCache: false
          };
        }

        return data;
      } catch (apiError) {
        // If API fails, try to return cached data
        console.log('❌ API failed, falling back to cache:', apiError.message);
        const cachedApps = await offlineService.getApplications();

        if (cachedApps.length > 0) {
          return {
            success: true,
            data: { applications: cachedApps },
            fromCache: true,
            message: `Network error. Showing ${cachedApps.length} cached apps.`
          };
        }

        // No cache available
        return {
          success: false,
          data: { applications: [] },
          fromCache: false,
          message: 'Network error and no offline data available. Please check your internet connection.'
        };
      }
    } catch (error) {
      console.error('❌ Critical error in getApplications:', error);

      // Last resort - try to get cached data
      try {
        const cachedApps = await offlineService.getApplications();
        if (cachedApps.length > 0) {
          return {
            success: true,
            data: { applications: cachedApps },
            fromCache: true,
            message: `Error occurred. Showing ${cachedApps.length} cached apps.`
          };
        }
      } catch (cacheError) {
        console.error('❌ Cache also failed:', cacheError);
      }

      return {
        success: false,
        data: { applications: [] },
        fromCache: false,
        message: 'Unable to load applications. Please check your internet connection and try again.'
      };
    }
  }

  async getApplication(id) {
    try {
      const isOnline = await this.checkConnectivity();
      
      if (!isOnline) {
        const cachedApps = await offlineService.getApplications();
        const app = cachedApps.find(app => app.id === id);
        if (app) {
          return { success: true, data: app, fromCache: true };
        }
        throw new Error('Application not available offline');
      }

      const response = await this.fetchWithTimeout(`${this.baseURL}/api/applications/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting application:', error);
      throw error;
    }
  }

  async syncWithServer() {
    try {
      const isOnline = await this.checkConnectivity();
      if (!isOnline) {
        throw new Error('Cannot sync while offline');
      }

      console.log('Starting sync with server...');
      
      const response = await this.fetchWithTimeout(`${this.baseURL}/api/applications`);
      
      if (!response.ok) {
        throw new Error(`Sync failed: HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.applications) {
        await offlineService.storeApplications(data.data.applications);
        console.log('Sync completed successfully');
        return { success: true, message: 'Sync completed' };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }

  async getOfflineStatus() {
    const isOnline = await this.checkConnectivity();
    const lastSync = await offlineService.getLastSyncTime();
    const cacheSize = await offlineService.getCacheSize();
    const cachedApps = await offlineService.getApplications();
    
    return {
      isOnline,
      lastSync,
      cacheSize: offlineService.formatSize(cacheSize),
      cachedAppsCount: cachedApps.length,
      isDataStale: await offlineService.isDataStale()
    };
  }

  async healthCheck() {
    try {
      const response = await this.fetchWithTimeout(`${this.baseURL}/health`, {}, 5000);
      
      if (!response.ok) {
        throw new Error(`Health check failed: HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }
}

export default new ApiService();
