import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors, typography, spacing, borderRadius } from './theme';

const ToastContent = ({ type, text1, text2 }) => {
  const getIconName = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'success':
        return colors.success;
      case 'error':
        return colors.error;
      case 'info':
        return colors.info;
      case 'warning':
        return colors.warning;
      default:
        return colors.info;
    }
  };

  return (
    <View style={[styles.container, styles[type]]}>
      <Icon 
        name={getIconName()} 
        size={24} 
        color={getIconColor()} 
        style={styles.icon}
      />
      <View style={styles.textContainer}>
        {text1 && <Text style={styles.title}>{text1}</Text>}
        {text2 && <Text style={styles.message}>{text2}</Text>}
      </View>
    </View>
  );
};

export const toastConfig = {
  success: ({ text1, text2 }) => (
    <ToastContent type="success" text1={text1} text2={text2} />
  ),
  error: ({ text1, text2 }) => (
    <ToastContent type="error" text1={text1} text2={text2} />
  ),
  info: ({ text1, text2 }) => (
    <ToastContent type="info" text1={text1} text2={text2} />
  ),
  warning: ({ text1, text2 }) => (
    <ToastContent type="warning" text1={text1} text2={text2} />
  ),
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  success: {
    borderLeftColor: colors.success,
  },
  error: {
    borderLeftColor: colors.error,
  },
  info: {
    borderLeftColor: colors.info,
  },
  warning: {
    borderLeftColor: colors.warning,
  },
  icon: {
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginBottom: 2,
  },
  message: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.sm,
  },
});

export default toastConfig;
