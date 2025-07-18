import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import DeviceInfo from 'react-native-device-info';

import { colors, typography, spacing, borderRadius, shadows } from '../utils/theme';

const AboutScreen = () => {
  const appVersion = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();

  const handleContactPress = (type, value) => {
    let url = '';
    let title = '';

    switch (type) {
      case 'email':
        url = `mailto:${value}`;
        title = 'Email';
        break;
      case 'phone':
        url = `tel:${value}`;
        title = 'Phone';
        break;
      case 'website':
        url = value.startsWith('http') ? value : `https://${value}`;
        title = 'Website';
        break;
      default:
        return;
    }

    Alert.alert(
      `Open ${title}`,
      `Do you want to open ${value}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open',
          onPress: () => {
            Linking.openURL(url).catch(err => {
              console.error('Error opening URL:', err);
              Alert.alert('Error', `Could not open ${title}`);
            });
          },
        },
      ]
    );
  };

  const InfoCard = ({ icon, title, children }) => (
    <View style={styles.infoCard}>
      <View style={styles.cardHeader}>
        <Icon name={icon} size={24} color={colors.primary} />
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardContent}>
        {children}
      </View>
    </View>
  );

  const ContactItem = ({ icon, label, value, type }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => handleContactPress(type, value)}
    >
      <Icon name={icon} size={20} color={colors.primary} />
      <View style={styles.contactInfo}>
        <Text style={styles.contactLabel}>{label}</Text>
        <Text style={styles.contactValue}>{value}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* School Logo/Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Icon name="school" size={64} color={colors.primary} />
        </View>
        <Text style={styles.schoolName}>DGMS School</Text>
        <Text style={styles.schoolSubtitle}>Excellence in Education</Text>
      </View>

      {/* App Information */}
      <InfoCard icon="info" title="About DGMS Hub">
        <Text style={styles.description}>
          DGMS Hub is your centralized platform for accessing all school-related web applications. 
          This mobile app provides quick and easy access to student portals, learning management systems, 
          library catalogs, and other essential school services.
        </Text>
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version: {appVersion}</Text>
          <Text style={styles.versionText}>Build: {buildNumber}</Text>
        </View>
      </InfoCard>

      {/* School Information */}
      <InfoCard icon="location-on" title="School Information">
        <View style={styles.schoolInfo}>
          <Text style={styles.schoolInfoText}>
            <Text style={styles.label}>Address: </Text>
            123 Education Street{'\n'}
            Learning City, LC 12345
          </Text>
          <Text style={styles.schoolInfoText}>
            <Text style={styles.label}>Established: </Text>
            1985
          </Text>
          <Text style={styles.schoolInfoText}>
            <Text style={styles.label}>Principal: </Text>
            Dr. Jane Smith
          </Text>
        </View>
      </InfoCard>

      {/* Contact Information */}
      <InfoCard icon="contact-phone" title="Contact Information">
        <ContactItem
          icon="phone"
          label="Main Office"
          value="+1 (555) 123-4567"
          type="phone"
        />
        <ContactItem
          icon="email"
          label="General Inquiries"
          value="info@dgms.edu"
          type="email"
        />
        <ContactItem
          icon="email"
          label="IT Support"
          value="support@dgms.edu"
          type="email"
        />
        <ContactItem
          icon="web"
          label="School Website"
          value="www.dgms.edu"
          type="website"
        />
      </InfoCard>

      {/* Features */}
      <InfoCard icon="star" title="App Features">
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Icon name="web" size={16} color={colors.success} />
            <Text style={styles.featureText}>Access all school web applications</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="offline-bolt" size={16} color={colors.success} />
            <Text style={styles.featureText}>Offline mode support</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="security" size={16} color={colors.success} />
            <Text style={styles.featureText}>Secure and encrypted connections</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="refresh" size={16} color={colors.success} />
            <Text style={styles.featureText}>Auto-refresh and sync</Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="category" size={16} color={colors.success} />
            <Text style={styles.featureText}>Organized by categories</Text>
          </View>
        </View>
      </InfoCard>

      {/* Support */}
      <InfoCard icon="help" title="Need Help?">
        <Text style={styles.supportText}>
          If you encounter any issues with the app or need assistance accessing school applications, 
          please contact our IT support team.
        </Text>
        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => handleContactPress('email', 'support@dgms.edu')}
        >
          <Icon name="email" size={20} color={colors.textLight} />
          <Text style={styles.supportButtonText}>Contact IT Support</Text>
        </TouchableOpacity>
      </InfoCard>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 DGMS School. All rights reserved.
        </Text>
        <Text style={styles.footerSubtext}>
          Developed by DGMS IT Department
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
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    ...shadows.md,
  },
  schoolName: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  schoolSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  cardContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.md,
  },
  versionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  versionText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  schoolInfo: {
    gap: spacing.sm,
  },
  schoolInfoText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: typography.lineHeight.md,
  },
  label: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contactInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  contactLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  contactValue: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    fontWeight: typography.fontWeight.medium,
  },
  featuresList: {
    gap: spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  supportText: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.md,
  },
  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  supportButtonText: {
    color: colors.textLight,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    marginLeft: spacing.sm,
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
    marginBottom: spacing.xs,
  },
  footerSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default AboutScreen;
