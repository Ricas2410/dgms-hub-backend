import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Platform,
  BackHandler,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

// Professional School Colors - Deigratia Montessori School
const COLORS = {
  primary: '#1e40af',      // Professional Blue
  secondary: '#3b82f6',    // Lighter Blue
  accent: '#10b981',       // Success Green
  background: '#f8fafc',   // Light Gray Background
  white: '#ffffff',
  text: '#1f2937',         // Dark Gray Text
  textLight: '#6b7280',    // Light Gray Text
  border: '#e5e7eb',       // Border Gray
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
};

// API Configuration
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://dgms-hub-backend.onrender.com';

// Professional Mock Applications
const MOCK_APPLICATIONS = [
  {
    id: 1,
    name: 'Google Classroom',
    description: 'Online learning platform for assignments and resources',
    category: 'Education',
    url: 'https://classroom.google.com',
    icon: 'https://ssl.gstatic.com/classroom/favicon.png',
    isActive: true
  },
  {
    id: 2,
    name: 'Khan Academy',
    description: 'Free online courses and practice exercises',
    category: 'Education',
    url: 'https://www.khanacademy.org',
    icon: 'https://cdn.kastatic.org/images/favicon.ico',
    isActive: true
  },
  {
    id: 3,
    name: 'Zoom',
    description: 'Video conferencing for virtual classes',
    category: 'Communication',
    url: 'https://zoom.us',
    icon: 'https://zoom.us/favicon.ico',
    isActive: true
  },
  {
    id: 4,
    name: 'Microsoft Teams',
    description: 'Collaboration platform for team communication',
    category: 'Communication',
    url: 'https://teams.microsoft.com',
    icon: 'https://res.cdn.office.net/teams/favicon.ico',
    isActive: true
  }
];

const DGMSHub = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentView, setCurrentView] = useState('home'); // 'home' or 'webview'
  const [currentUrl, setCurrentUrl] = useState('');
  const [currentAppName, setCurrentAppName] = useState('');

  // Get unique categories
  const categories = ['All', ...new Set(applications.map(app => app.category))];

  useEffect(() => {
    loadApplications();
    
    // Handle Android back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    if (currentView === 'webview') {
      setCurrentView('home');
      return true; // Prevent default behavior
    }
    return false; // Allow default behavior (exit app)
  };

  // Check for admin dashboard updates
  useEffect(() => {
    const checkAdminUpdates = () => {
      try {
        const adminData = localStorage.getItem('dgms_applications');
        if (adminData) {
          const parsedData = JSON.parse(adminData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            setApplications(parsedData);
          }
        }
      } catch (error) {
        console.log('No admin updates found');
      }
    };

    // Check for updates every 5 seconds
    const interval = setInterval(checkAdminUpdates, 5000);
    checkAdminUpdates(); // Check immediately

    return () => clearInterval(interval);
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from API first
      const response = await fetch(`${API_BASE_URL}/api/applications`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        // Fallback to mock data
        setApplications(MOCK_APPLICATIONS);
      }
    } catch (error) {
      console.log('Using mock data:', error.message);
      setApplications(MOCK_APPLICATIONS);
    } finally {
      setLoading(false);
    }
  };

  const openApplication = (url, appName) => {
    setCurrentUrl(url);
    setCurrentAppName(appName);
    setCurrentView('webview');
  };

  const goHome = () => {
    setCurrentView('home');
    setCurrentUrl('');
    setCurrentAppName('');
  };

  // Ensure applications is always an array
  const safeApplications = Array.isArray(applications) ? applications : MOCK_APPLICATIONS;

  const filteredApplications = safeApplications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    return matchesSearch && matchesCategory && app.isActive;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading DGMS Hub...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // WebView Screen
  if (currentView === 'webview') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        
        {/* WebView Header */}
        <View style={styles.webviewHeader}>
          <TouchableOpacity style={styles.backButton} onPress={goHome}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.webviewTitle} numberOfLines={1}>
            {currentAppName}
          </Text>
          <TouchableOpacity style={styles.homeButton} onPress={goHome}>
            <Text style={styles.homeButtonText}>🏠 Home</Text>
          </TouchableOpacity>
        </View>

        {/* WebView */}
        <WebView
          source={{ uri: currentUrl }}
          style={styles.webview}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webviewLoading}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.webviewLoadingText}>Loading {currentAppName}...</Text>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  // Home Screen
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Professional Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>DGMS Hub</Text>
          <Text style={styles.headerSubtitle}>Deigratia Montessori School</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search applications..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.textLight}
        />
      </View>

      {/* Compact Category Filter */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryContainer}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextActive
              ]}>
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Applications Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.applicationsGrid}>
          {filteredApplications.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={styles.appCard}
              onPress={() => openApplication(app.url, app.name)}
            >
              <View style={styles.appIconContainer}>
                <Image
                  source={{ uri: app.icon }}
                  style={styles.appIcon}
                  defaultSource={require('./assets/icon.png')}
                />
              </View>
              <Text style={styles.appName} numberOfLines={2}>
                {app.name}
              </Text>
              <Text style={styles.appDescription} numberOfLines={2}>
                {app.description}
              </Text>
              <View style={styles.appCategory}>
                <Text style={styles.appCategoryText}>{app.category}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {filteredApplications.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No applications found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search or category filter
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },

  // Header Styles
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
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
    fontWeight: '500',
  },

  // Search Styles
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  // Category Styles - Compact Design
  categorySection: {
    paddingBottom: 16,
  },
  categoryContainer: {
    paddingHorizontal: 20,
  },
  categoryContent: {
    paddingRight: 20,
  },
  categoryButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryTextActive: {
    color: COLORS.white,
  },

  // Content Styles
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  applicationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },

  // App Card Styles - Professional Design
  appCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    width: '48%',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  appIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 20,
  },
  appDescription: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 16,
  },
  appCategory: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'center',
  },
  appCategoryText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },

  // WebView Styles
  webviewHeader: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  backButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  webviewTitle: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginHorizontal: 16,
  },
  homeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
  },
  homeButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: 14,
  },
  webview: {
    flex: 1,
  },
  webviewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  webviewLoadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default DGMSHub;
