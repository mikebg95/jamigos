import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.todoproject.app',
  appName: 'Todo Project',
  webDir: 'dist',

  // iOS-specific configuration
  ios: {
    contentInset: 'automatic'
  }
};

export default config;
