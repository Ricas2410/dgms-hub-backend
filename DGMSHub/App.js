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

// API Configuration
const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || 'https://dgms-hub-backend.onrender.com';

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
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setApplications(data.data);
        }
      } catch (error) {
        console.log('Using mock data:', error.message);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/applications/meta/categories`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data.categories)) {
          setCategories(['All', ...data.data.categories]);
        }
      } catch (error) {
        console.log('Using mock categories:', error.message);
      }

      setLoading(false);
    };

    loadData();
  }, []);



  const openApplication = (url) => {
    // For web platform, open in same window/tab
    if (Platform.OS === 'web') {
      window.open(url, '_self');
    } else {
      // For mobile, use Linking
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Cannot open this application');
      });
    }
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
          {filteredApplications.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={styles.appCard}
              onPress={() => openApplication(app.url)}
            >
              <View style={styles.appIconContainer}>
                <Image
                  source={{ uri: app.icon }}
                  style={styles.appIcon}
                />
              </View>
              <Text style={styles.appName} numberOfLines={2}>
                {app.name}
              </Text>
              <Text style={styles.appDescription} numberOfLines={3}>
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
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  appIconContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8fafc',
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
    minHeight: 32,
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
    color: COLORS.primary,
    fontWeight: '600',
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
