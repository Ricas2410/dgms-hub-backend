import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Initial state
const initialState = {
  // Network status
  isConnected: true,
  connectionType: 'unknown',
  
  // App settings
  settings: {
    theme: 'light',
    notifications: true,
    autoRefresh: true,
    refreshInterval: 300000, // 5 minutes
  },
  
  // Application data
  applications: [],
  categories: [],
  
  // Loading states
  loading: {
    applications: false,
    categories: false,
  },
  
  // Error states
  errors: {
    applications: null,
    categories: null,
    network: null,
  },
  
  // Cache timestamps
  lastUpdated: {
    applications: null,
    categories: null,
  },
};

// Action types
const ActionTypes = {
  // Network actions
  SET_NETWORK_STATUS: 'SET_NETWORK_STATUS',
  
  // Settings actions
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  LOAD_SETTINGS: 'LOAD_SETTINGS',
  
  // Applications actions
  SET_APPLICATIONS_LOADING: 'SET_APPLICATIONS_LOADING',
  SET_APPLICATIONS_SUCCESS: 'SET_APPLICATIONS_SUCCESS',
  SET_APPLICATIONS_ERROR: 'SET_APPLICATIONS_ERROR',
  
  // Categories actions
  SET_CATEGORIES_LOADING: 'SET_CATEGORIES_LOADING',
  SET_CATEGORIES_SUCCESS: 'SET_CATEGORIES_SUCCESS',
  SET_CATEGORIES_ERROR: 'SET_CATEGORIES_ERROR',
  
  // General actions
  CLEAR_ERRORS: 'CLEAR_ERRORS',
  RESET_STATE: 'RESET_STATE',
};

// Reducer function
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_NETWORK_STATUS:
      return {
        ...state,
        isConnected: action.payload.isConnected,
        connectionType: action.payload.type,
        errors: {
          ...state.errors,
          network: action.payload.isConnected ? null : 'No internet connection',
        },
      };

    case ActionTypes.UPDATE_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case ActionTypes.LOAD_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };

    case ActionTypes.SET_APPLICATIONS_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          applications: action.payload,
        },
        errors: {
          ...state.errors,
          applications: null,
        },
      };

    case ActionTypes.SET_APPLICATIONS_SUCCESS:
      return {
        ...state,
        applications: action.payload,
        loading: {
          ...state.loading,
          applications: false,
        },
        errors: {
          ...state.errors,
          applications: null,
        },
        lastUpdated: {
          ...state.lastUpdated,
          applications: new Date().toISOString(),
        },
      };

    case ActionTypes.SET_APPLICATIONS_ERROR:
      return {
        ...state,
        loading: {
          ...state.loading,
          applications: false,
        },
        errors: {
          ...state.errors,
          applications: action.payload,
        },
      };

    case ActionTypes.SET_CATEGORIES_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          categories: action.payload,
        },
        errors: {
          ...state.errors,
          categories: null,
        },
      };

    case ActionTypes.SET_CATEGORIES_SUCCESS:
      return {
        ...state,
        categories: action.payload,
        loading: {
          ...state.loading,
          categories: false,
        },
        errors: {
          ...state.errors,
          categories: null,
        },
        lastUpdated: {
          ...state.lastUpdated,
          categories: new Date().toISOString(),
        },
      };

    case ActionTypes.SET_CATEGORIES_ERROR:
      return {
        ...state,
        loading: {
          ...state.loading,
          categories: false,
        },
        errors: {
          ...state.errors,
          categories: action.payload,
        },
      };

    case ActionTypes.CLEAR_ERRORS:
      return {
        ...state,
        errors: {
          applications: null,
          categories: null,
          network: state.errors.network, // Keep network error
        },
      };

    case ActionTypes.RESET_STATE:
      return {
        ...initialState,
        isConnected: state.isConnected,
        connectionType: state.connectionType,
        settings: state.settings,
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Context provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load settings from AsyncStorage on app start
  useEffect(() => {
    loadSettings();
  }, []);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch({
        type: ActionTypes.SET_NETWORK_STATUS,
        payload: {
          isConnected: state.isConnected,
          type: state.type,
        },
      });
    });

    return unsubscribe;
  }, []);

  // Save settings to AsyncStorage when they change
  useEffect(() => {
    saveSettings(state.settings);
  }, [state.settings]);

  // Helper functions
  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        dispatch({
          type: ActionTypes.LOAD_SETTINGS,
          payload: parsedSettings,
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (settings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Action creators
  const actions = {
    updateSettings: (settings) => {
      dispatch({
        type: ActionTypes.UPDATE_SETTINGS,
        payload: settings,
      });
    },

    setApplicationsLoading: (loading) => {
      dispatch({
        type: ActionTypes.SET_APPLICATIONS_LOADING,
        payload: loading,
      });
    },

    setApplicationsSuccess: (applications) => {
      dispatch({
        type: ActionTypes.SET_APPLICATIONS_SUCCESS,
        payload: applications,
      });
    },

    setApplicationsError: (error) => {
      dispatch({
        type: ActionTypes.SET_APPLICATIONS_ERROR,
        payload: error,
      });
    },

    setCategoriesLoading: (loading) => {
      dispatch({
        type: ActionTypes.SET_CATEGORIES_LOADING,
        payload: loading,
      });
    },

    setCategoriesSuccess: (categories) => {
      dispatch({
        type: ActionTypes.SET_CATEGORIES_SUCCESS,
        payload: categories,
      });
    },

    setCategoriesError: (error) => {
      dispatch({
        type: ActionTypes.SET_CATEGORIES_ERROR,
        payload: error,
      });
    },

    clearErrors: () => {
      dispatch({
        type: ActionTypes.CLEAR_ERRORS,
      });
    },

    resetState: () => {
      dispatch({
        type: ActionTypes.RESET_STATE,
      });
    },
  };

  const value = {
    state,
    actions,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
