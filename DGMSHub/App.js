import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import apiService from './src/services/apiService';
import backgroundSync from './src/services/backgroundSync';
import offlineService from './src/services/offlineService';

// School colors - Deigratia Montessori School
const COLORS = {
  primary: '#1e3a8a',
  secondary: '#ec4899',
  accent: '#fbbf24',
  danger: '#ef4444',
  white: '#ffffff',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  success: '#10b981',
  warning: '#f59e0b',
};

export default function App() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentAppName, setCurrentAppName] = useState('');
  const [isOffline, setIsOffline] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load applications with better error handling
  const loadApplications = async (forceOnline = false) => {
    try {
      if (!forceOnline) setLoading(true);

      const response = await apiService.getApplications(forceOnline);

      // Always set applications, even if empty
      const apps = response.data.applications || [];
      setApplications(apps);

      // Update offline status
      setIsOffline(response.fromCache || false);

      // Log status for debugging
      if (response.fromCache) {
        console.log(`📱 Offline mode: ${apps.length} apps loaded from cache`);
      } else {
        console.log(`🌐 Online mode: ${apps.length} apps loaded from server`);
      }

    } catch (error) {
      console.error('❌ Error loading applications:', error);
      setIsOffline(true);

      // Try to load from cache as last resort
      try {
        const cachedApps = await offlineService.getApplications();
        setApplications(cachedApps);
        console.log(`📱 Fallback: ${cachedApps.length} apps from emergency cache`);
      } catch (cacheError) {
        console.error('❌ Emergency cache also failed:', cacheError);
        setApplications([]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    await loadApplications(true);
  };

  // Setup background sync listener
  useEffect(() => {
    const unsubscribe = backgroundSync.addSyncListener((event, data) => {
      switch (event) {
        case 'syncSuccess':
          console.log('Background sync completed:', data);
          // Reload applications after successful sync
          loadApplications(false);
          break;
        case 'syncError':
          console.error('Background sync failed:', data);
          break;
        case 'networkChange':
          setIsOffline(!data.isOnline);
          break;
      }
    });

    return unsubscribe;
  }, []);

  // Initial load and preload content
  useEffect(() => {
    loadApplications();

    // Preload content for offline use
    setTimeout(() => {
      backgroundSync.preloadContent();
    }, 2000); // Wait 2 seconds after initial load
  }, []);

  // Filter applications
  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory && app.isActive;
  });

  // Get unique categories
  const categories = ['All', ...new Set(applications.map(app => app.category))];

  // Open application
  const openApplication = (url, appName) => {
    setCurrentUrl(url);
    setCurrentAppName(appName);
    setWebViewVisible(true);
  };

  // Render offline indicator (compact version)
  const renderOfflineIndicator = () => {
    if (!isOffline) return null;

    return (
      <View style={styles.offlineIndicator}>
        <Ionicons name="wifi-off" size={12} color={COLORS.warning} />
        <Text style={styles.offlineText}>Offline</Text>
        <TouchableOpacity
          onPress={() => loadApplications(true)}
          style={styles.retryButton}
        >
          <Ionicons name="refresh" size={12} color={COLORS.warning} />
        </TouchableOpacity>
      </View>
    );
  };

  // Render application item
  const renderApplicationItem = (app) => (
    <TouchableOpacity
      key={app.id}
      style={[styles.appItem, { backgroundColor: app.backgroundColor || COLORS.primary }]}
      onPress={() => openApplication(app.url, app.name)}
    >
      {app.iconUrl ? (
        <Image
          source={{ uri: app.iconUrl }}
          style={styles.appIcon}
          onError={() => console.log(`Failed to load icon for ${app.name}`)}
        />
      ) : (
        <Ionicons name="globe-outline" size={32} color={app.textColor || COLORS.white} />
      )}
      <Text style={[styles.appName, { color: app.textColor || COLORS.white }]} numberOfLines={2}>
        {app.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ExpoStatusBar style="light" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ExpoStatusBar style="light" />
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DGMS Hub</Text>
        <Text style={styles.headerSubtitle}>School Applications</Text>
        {renderOfflineIndicator()}
      </View>

      {/* Applications Grid */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        <View style={styles.appsGrid}>
          {filteredApplications.map(renderApplicationItem)}
        </View>
        
        {applications.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Ionicons
              name={isOffline ? "wifi-off" : "apps-outline"}
              size={64}
              color={COLORS.gray}
            />
            <Text style={styles.emptyText}>
              {isOffline ? 'No Offline Data Available' : 'No Applications Found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {isOffline
                ? 'Connect to internet to download applications for offline use'
                : 'Applications will appear here when added by admin'
              }
            </Text>
            {isOffline && (
              <TouchableOpacity
                style={styles.retryButtonLarge}
                onPress={() => loadApplications(true)}
              >
                <Ionicons name="refresh" size={20} color={COLORS.white} />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* WebView Modal */}
      <Modal
        visible={webViewVisible}
        animationType="slide"
        onRequestClose={() => setWebViewVisible(false)}
      >
        <SafeAreaView style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              onPress={() => setWebViewVisible(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={COLORS.white} />
            </TouchableOpacity>
            <Text style={styles.webViewTitle} numberOfLines={1}>
              {currentAppName}
            </Text>
          </View>
          
          <WebView
            source={{ uri: currentUrl }}
            style={styles.webView}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.gray,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginTop: 8,
  },
  offlineText: {
    color: COLORS.warning,
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  retryButton: {
    marginLeft: 8,
    padding: 4,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  content: {
    flex: 1,
  },
  appsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  appItem: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  appIcon: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  appName: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.gray,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  retryButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  webViewHeader: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  webViewTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.white,
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
});
