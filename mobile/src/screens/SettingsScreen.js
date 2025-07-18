import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';

import { useApp } from '../context/AppContext';
import { cache } from '../services/api';
import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

const SettingsScreen = () => {
  const { state, actions } = useApp();
  const [clearingCache, setClearingCache] = useState(false);

  const handleToggleSetting = (setting, value) => {
    actions.updateSettings({ [setting]: value });
    
    Toast.show({
      type: 'success',
      text1: 'Settings Updated',
      text2: `${setting} has been ${value ? 'enabled' : 'disabled'}`,
    });
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data and may require re-downloading content. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setClearingCache(true);
            try {
              await cache.clear();
              Toast.show({
                type: 'success',
                text1: 'Cache Cleared',
                text2: 'All cached data has been removed',
              });
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to clear cache',
              });
            } finally {
              setClearingCache(false);
            }
          },
        },
      ]
    );
  };

  const handleRefreshIntervalChange = () => {
    const intervals = [
      { label: '1 minute', value: 60000 },
      { label: '5 minutes', value: 300000 },
      { label: '10 minutes', value: 600000 },
      { label: '30 minutes', value: 1800000 },
      { label: '1 hour', value: 3600000 },
    ];

    const currentIndex = intervals.findIndex(
      interval => interval.value === state.settings.refreshInterval
    );

    Alert.alert(
      'Auto Refresh Interval',
      'Select how often the app should refresh data:',
      [
        ...intervals.map((interval, index) => ({
          text: interval.label + (index === currentIndex ? ' ✓' : ''),
          onPress: () => {
            actions.updateSettings({ refreshInterval: interval.value });
            Toast.show({
              type: 'success',
              text1: 'Settings Updated',
              text2: `Refresh interval set to ${interval.label}`,
            });
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  const SettingItem = ({ icon, title, subtitle, rightComponent, onPress }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <Icon name={icon} size={24} color={colors.primary} />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent}
    </TouchableOpacity>
  );

  const getRefreshIntervalLabel = () => {
    const minutes = state.settings.refreshInterval / 60000;
    if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    const hours = minutes / 60;
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* App Settings */}
      <SettingSection title="App Settings">
        <SettingItem
          icon="notifications"
          title="Notifications"
          subtitle="Enable push notifications for updates"
          rightComponent={
            <Switch
              value={state.settings.notifications}
              onValueChange={(value) => handleToggleSetting('notifications', value)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={state.settings.notifications ? colors.primary : colors.textSecondary}
            />
          }
        />

        <SettingItem
          icon="refresh"
          title="Auto Refresh"
          subtitle="Automatically refresh app data"
          rightComponent={
            <Switch
              value={state.settings.autoRefresh}
              onValueChange={(value) => handleToggleSetting('autoRefresh', value)}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={state.settings.autoRefresh ? colors.primary : colors.textSecondary}
            />
          }
        />

        <SettingItem
          icon="schedule"
          title="Refresh Interval"
          subtitle={`Update data every ${getRefreshIntervalLabel()}`}
          onPress={handleRefreshIntervalChange}
          rightComponent={
            <Icon name="chevron-right" size={20} color={colors.textSecondary} />
          }
        />
      </SettingSection>

      {/* Data & Storage */}
      <SettingSection title="Data & Storage">
        <SettingItem
          icon="storage"
          title="Clear Cache"
          subtitle="Remove cached data to free up space"
          onPress={handleClearCache}
          rightComponent={
            clearingCache ? (
              <Icon name="refresh" size={20} color={colors.primary} />
            ) : (
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            )
          }
        />
      </SettingSection>

      {/* Network Status */}
      <SettingSection title="Network Status">
        <SettingItem
          icon={state.isConnected ? "wifi" : "wifi-off"}
          title="Connection Status"
          subtitle={
            state.isConnected 
              ? `Connected via ${state.connectionType}` 
              : "No internet connection"
          }
          rightComponent={
            <View style={[
              styles.statusIndicator,
              { backgroundColor: state.isConnected ? colors.success : colors.error }
            ]} />
          }
        />
      </SettingSection>

      {/* App Information */}
      <SettingSection title="App Information">
        <SettingItem
          icon="info"
          title="Last Updated"
          subtitle={
            state.lastUpdated.applications
              ? new Date(state.lastUpdated.applications).toLocaleString()
              : "Never"
          }
        />

        <SettingItem
          icon="apps"
          title="Applications Count"
          subtitle={`${state.applications.length} applications available`}
        />

        <SettingItem
          icon="category"
          title="Categories"
          subtitle={`${state.categories.length} categories`}
        />
      </SettingSection>

      {/* Debug Information (Development only) */}
      {__DEV__ && (
        <SettingSection title="Debug Information">
          <SettingItem
            icon="bug-report"
            title="Debug Mode"
            subtitle="Development build"
            rightComponent={
              <View style={[styles.statusIndicator, { backgroundColor: colors.warning }]} />
            }
          />

          <SettingItem
            icon="code"
            title="View State"
            subtitle="Show current app state"
            onPress={() => {
              console.log('Current App State:', state);
              Alert.alert('Debug', 'App state logged to console');
            }}
            rightComponent={
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            }
          />
        </SettingSection>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Settings are automatically saved
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text,
  },
  settingSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default SettingsScreen;
