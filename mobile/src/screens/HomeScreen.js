import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FastImage from 'react-native-fast-image';
import Toast from 'react-native-toast-message';

import { useApp } from '../context/AppContext';
import { api, cache } from '../services/api';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - spacing.md * 3) / 2;

const HomeScreen = ({ navigation }) => {
  const { state, actions } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async (showLoading = true) => {
    if (showLoading) {
      actions.setApplicationsLoading(true);
    }

    try {
      // Try to get cached data first
      const cachedData = await cache.get('applications');
      if (cachedData && !showLoading) {
        actions.setApplicationsSuccess(cachedData.applications || []);
        return;
      }

      // Fetch fresh data from API
      const response = await api.getApplications();
      
      if (response.success) {
        const applications = response.data.applications || [];
        actions.setApplicationsSuccess(applications);
        
        // Cache the data
        await cache.set('applications', { applications }, 30); // Cache for 30 minutes
        
        if (showLoading) {
          Toast.show({
            type: 'success',
            text1: 'Applications loaded',
            text2: `Found ${applications.length} applications`,
          });
        }
      } else {
        throw new Error(response.message || 'Failed to load applications');
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      actions.setApplicationsError(error.message || 'Failed to load applications');
      
      // Try to show cached data on error
      const cachedData = await cache.get('applications');
      if (cachedData) {
        actions.setApplicationsSuccess(cachedData.applications || []);
        Toast.show({
          type: 'warning',
          text1: 'Using cached data',
          text2: 'Could not fetch latest applications',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: error.message || 'Failed to load applications',
        });
      }
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadApplications(false);
    setRefreshing(false);
  }, []);

  const handleApplicationPress = (application) => {
    if (!state.isConnected) {
      Alert.alert(
        'No Internet Connection',
        'Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
      return;
    }

    navigation.navigate('WebView', {
      url: application.url,
      title: application.name,
      applicationId: application.id,
    });
  };

  const getFilteredApplications = () => {
    if (selectedCategory === 'All') {
      return state.applications;
    }
    return state.applications.filter(app => app.category === selectedCategory);
  };

  const getCategories = () => {
    const categories = ['All'];
    const uniqueCategories = [...new Set(state.applications.map(app => app.category).filter(Boolean))];
    return categories.concat(uniqueCategories.sort());
  };

  const renderApplicationItem = ({ item }) => (
    <TouchableOpacity
      style={styles.applicationItem}
      onPress={() => handleApplicationPress(item)}
      activeOpacity={0.7}
    >
      <View style={[
        styles.applicationContent,
        { backgroundColor: item.backgroundColor || colors.primary }
      ]}>
        {item.iconUrl ? (
          <FastImage
            source={{ uri: item.iconUrl }}
            style={styles.applicationIcon}
            resizeMode={FastImage.resizeMode.contain}
          />
        ) : (
          <Icon
            name="web"
            size={40}
            color={item.textColor || colors.textLight}
          />
        )}
        
        <Text
          style={[
            styles.applicationName,
            { color: item.textColor || colors.textLight }
          ]}
          numberOfLines={2}
        >
          {item.name}
        </Text>
        
        {item.description && (
          <Text
            style={[
              styles.applicationDescription,
              { color: item.textColor || colors.textLight }
            ]}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => {
    const categories = getCategories();
    
    if (categories.length <= 1) return null;

    return (
      <View style={styles.categoryContainer}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === item && styles.categoryTextActive
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.categoryList}
        />
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="web" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Applications Found</Text>
      <Text style={styles.emptyMessage}>
        {selectedCategory === 'All' 
          ? 'No applications are currently available.'
          : `No applications found in "${selectedCategory}" category.`
        }
      </Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => loadApplications()}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOfflineIndicator = () => {
    if (state.isConnected) return null;

    return (
      <View style={styles.offlineIndicator}>
        <Icon name="wifi-off" size={16} color={colors.textLight} />
        <Text style={styles.offlineText}>Offline Mode</Text>
      </View>
    );
  };

  const filteredApplications = getFilteredApplications();

  return (
    <View style={styles.container}>
      {renderOfflineIndicator()}
      {renderCategoryFilter()}
      
      {state.loading.applications ? (
        <View style={styles.loadingContainer}>
          <Icon name="refresh" size={32} color={colors.primary} />
          <Text style={styles.loadingText}>Loading applications...</Text>
        </View>
      ) : filteredApplications.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={filteredApplications}
          renderItem={renderApplicationItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.applicationsList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warning,
    paddingVertical: spacing.xs,
  },
  offlineText: {
    color: colors.textLight,
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  categoryContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryList: {
    paddingHorizontal: spacing.md,
  },
  categoryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  categoryTextActive: {
    color: colors.textLight,
  },
  applicationsList: {
    padding: spacing.md,
  },
  applicationItem: {
    width: ITEM_WIDTH,
    marginRight: spacing.md,
    marginBottom: spacing.md,
  },
  applicationContent: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    ...shadows.md,
  },
  applicationIcon: {
    width: 40,
    height: 40,
    marginBottom: spacing.sm,
  },
  applicationName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  applicationDescription: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.textLight,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
});

export default HomeScreen;
