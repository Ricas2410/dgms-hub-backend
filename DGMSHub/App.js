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
  Linking,
  ActivityIndicator,
  Platform,
} from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

// School colors - Deigratia Montessori School
const COLORS = {
  primary: '#1e3a8a',      // Dark Blue
  secondary: '#ec4899',     // Pink
  accent: '#fbbf24',        // Yellow
  danger: '#ef4444',        // Red
  white: '#ffffff',
  gray: '#6b7280',
  lightGray: '#f3f4f6',
  success: '#10b981',
};

// API Configuration - Production Ready
const API_BASE_URL = 'https://dgms-hub-backend.onrender.com';

// Beautiful App Colors (like in the original design)
const APP_COLORS = [
  '#1976D2', // Blue
  '#388E3C', // Green
  '#F57C00', // Orange
  '#D32F2F', // Red
  '#7B1FA2', // Purple
  '#00796B', // Teal
  '#5D4037', // Brown
  '#455A64', // Blue Grey
];

// Mock data for fallback
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

export default function App() {
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [categories, setCategories] = useState(['All', 'Education', 'Communication', 'Productivity']);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetch data from backend
  useEffect(() => {
    // Try to fetch from API, but keep mock data if it fails
    const loadData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/applications`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data.applications)) {
          // Transform the production API data to match our app format
          const transformedApps = result.data.applications.map(app => ({
            id: app.id,
            name: app.name,
            description: app.description,
            category: app.category,
            url: app.url,
            icon: app.iconUrl || `https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}`,
            isActive: app.isActive
          }));
          setApplications(transformedApps);

          // Extract unique categories from applications
          const uniqueCategories = [...new Set(transformedApps.map(app => app.category))];
          setCategories(['All', ...uniqueCategories]);
        } else {
          setApplications(MOCK_APPLICATIONS);
        }
      } catch (error) {
        console.log('Using mock data:', error.message);
        setApplications(MOCK_APPLICATIONS);
        setCategories(['All', 'Education', 'Communication', 'Productivity', 'Services']);
      }

      setLoading(false);
    };

    loadData();
  }, []);



  const openApplication = (url) => {
    // For web platform, open in same window/tab for better user experience
    if (Platform.OS === 'web') {
      window.open(url, '_self');
    } else {
      // For mobile, show confirmation dialog then open
      Alert.alert(
        'Open Application',
        'This will open the application in your browser. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Open',
            onPress: () => {
              Linking.openURL(url).catch(() => {
                Alert.alert('Error', 'Cannot open this application');
              });
            }
          }
        ]
      );
    }
  };

  // Check for admin dashboard updates
  useEffect(() => {
    const checkAdminUpdates = async () => {
      try {
        // Try to fetch from local admin API first
        const response = await fetch('http://localhost:3001/api/sync');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.applications) && data.applications.length > 0) {
            // Transform local admin data to match mobile app format
            const transformedApps = data.applications.map(app => ({
              id: app.id,
              name: app.name,
              description: app.description,
              category: app.category,
              url: app.url,
              icon: app.icon || `https://www.google.com/s2/favicons?domain=${new URL(app.url).hostname}`,
              isActive: app.isActive
            }));
            setApplications(transformedApps);
            return;
          }
        }
      } catch (error) {
        // Fallback to localStorage if API is not available
        try {
          const adminData = localStorage.getItem('dgms_applications');
          if (adminData) {
            const parsedData = JSON.parse(adminData);
            if (Array.isArray(parsedData) && parsedData.length > 0) {
              setApplications(parsedData);
            }
          }
        } catch (localError) {
          console.log('No admin updates found');
        }
      }
    };

    // Check for updates every 5 seconds
    const interval = setInterval(checkAdminUpdates, 5000);
    checkAdminUpdates(); // Check immediately

    return () => clearInterval(interval);
  }, []);

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>DGMS Hub</Text>
        <Text style={styles.headerSubtitle}>Deigratia Montessori School</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search applications..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray}
        />
      </View>

      {/* Category Filter */}
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

      {/* Applications Grid */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.applicationsGrid}>
          {filteredApplications.map((app, index) => (
            <TouchableOpacity
              key={app.id}
              style={[
                styles.appCard,
                { backgroundColor: APP_COLORS[index % APP_COLORS.length] }
              ]}
              onPress={() => openApplication(app.url)}
            >
              <View style={styles.appIconContainer}>
                <View style={styles.appIcon}>
                  <Ionicons
                    name="globe-outline"
                    size={32}
                    color="white"
                  />
                </View>
              </View>
              <Text style={styles.appName} numberOfLines={2}>
                {app.name}
              </Text>
              <Text style={styles.appDescription} numberOfLines={3}>
                {app.description}
              </Text>
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
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 20,
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  searchInput: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  categoryContainer: {
    backgroundColor: COLORS.white,
    paddingBottom: 12,
    maxHeight: 60,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  applicationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingTop: 16,
  },
  appCard: {
    width: '48%',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
    minHeight: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 0,
  },

  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.gray,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
  },
});
