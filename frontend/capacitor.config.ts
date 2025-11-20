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
  },
};

export default config;
