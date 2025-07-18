import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
  StatusBar,
  Animated,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Orientation from 'react-native-orientation-locker';

import { useApp } from '../context/AppContext';
import { colors, typography, spacing, layout } from '../utils/theme';

const WebViewScreen = ({ route, navigation }) => {
  const { url, title, applicationId } = route.params;
  const { state } = useApp();
  
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [progress, setProgress] = useState(0);
  
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Handle hardware back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    // Allow landscape orientation for web content
    Orientation.unlockAllOrientations();
    
    return () => {
      backHandler.remove();
      Orientation.lockToPortrait();
    };
  }, [canGoBack]);

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const handleBackPress = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  const handleNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
    setCanGoForward(navState.canGoForward);
    setCurrentUrl(navState.url);
    setLoading(navState.loading);
    
    // Update navigation title if it changes
    if (navState.title && navState.title !== title) {
      navigation.setOptions({ title: navState.title });
    }
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
    setProgress(0);
  };

  const handleLoadProgress = ({ nativeEvent }) => {
    setProgress(nativeEvent.progress);
  };

  const handleLoadEnd = () => {
    setLoading(false);
    setProgress(1);
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
    setError(nativeEvent.description || 'Failed to load page');
    setLoading(false);
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleGoBack = () => {
    if (canGoBack && webViewRef.current) {
      webViewRef.current.goBack();
    }
  };

  const handleGoForward = () => {
    if (canGoForward && webViewRef.current) {
      webViewRef.current.goForward();
    }
  };

  const handleShare = () => {
    Alert.alert(
      'Share',
      `Share ${title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Share URL', 
          onPress: () => {
            // Implement sharing functionality
            console.log('Sharing URL:', currentUrl);
          }
        },
      ]
    );
  };

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Icon name="error-outline" size={64} color={colors.error} />
      <Text style={styles.errorTitle}>Failed to Load</Text>
      <Text style={styles.errorMessage}>{error}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOfflineMessage = () => {
    if (state.isConnected) return null;

    return (
      <View style={styles.offlineContainer}>
        <Icon name="wifi-off" size={16} color={colors.textLight} />
        <Text style={styles.offlineText}>No internet connection</Text>
      </View>
    );
  };

  const renderProgressBar = () => {
    if (!loading || progress >= 1) return null;

    return (
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    );
  };

  const renderNavigationBar = () => (
    <View style={styles.navigationBar}>
      <TouchableOpacity
        style={[styles.navButton, !canGoBack && styles.navButtonDisabled]}
        onPress={handleGoBack}
        disabled={!canGoBack}
      >
        <Icon 
          name="arrow-back" 
          size={24} 
          color={canGoBack ? colors.primary : colors.textSecondary} 
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.navButton, !canGoForward && styles.navButtonDisabled]}
        onPress={handleGoForward}
        disabled={!canGoForward}
      >
        <Icon 
          name="arrow-forward" 
          size={24} 
          color={canGoForward ? colors.primary : colors.textSecondary} 
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={handleRefresh}>
        <Icon name="refresh" size={24} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.navButton} onPress={handleShare}>
        <Icon name="share" size={24} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  if (!state.isConnected) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
        {renderOfflineMessage()}
        <View style={styles.offlineContent}>
          <Icon name="wifi-off" size={64} color={colors.textSecondary} />
          <Text style={styles.offlineTitle}>No Internet Connection</Text>
          <Text style={styles.offlineSubtitle}>
            Please check your internet connection and try again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {renderProgressBar()}
      
      {error ? (
        renderError()
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webView}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadStart={handleLoadStart}
          onLoadProgress={handleLoadProgress}
          onLoadEnd={handleLoadEnd}
          onError={handleError}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          allowsBackForwardNavigationGestures={true}
          mixedContentMode="compatibility"
          userAgent="DGMSHub/1.0.0 (Mobile App)"
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <Icon name="web" size={48} color={colors.primary} />
              <Text style={styles.loadingText}>Loading {title}...</Text>
            </View>
          )}
        />
      )}
      
      {renderNavigationBar()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webView: {
    flex: 1,
  },
  progressContainer: {
    height: 3,
    backgroundColor: colors.border,
  },
  progressBar: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  navigationBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'space-around',
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: 8,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  errorMessage: {
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
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.textLight,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  offlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    paddingVertical: spacing.xs,
  },
  offlineText: {
    color: colors.textLight,
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.xs,
    fontWeight: typography.fontWeight.medium,
  },
  offlineContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  offlineTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  offlineSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.md,
  },
});

export default WebViewScreen;
