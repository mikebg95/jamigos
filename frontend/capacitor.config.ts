import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.jamigos.app',
  appName: 'Jamigos',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    // Allow clear text for local development (adjust as needed)
    cleartext: true,
  },
  plugins: {
    // App plugin for handling deep links / URL opens
    App: {
      // Deep link handling is enabled by default
    },
    // Splash Screen configuration
    SplashScreen: {
      launchShowDuration: 1000,
      launchAutoHide: true,
      launchFadeOutDuration: 300,
      backgroundColor: '#F8E8CD',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'small',
      spinnerColor: '#F9A548',
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
