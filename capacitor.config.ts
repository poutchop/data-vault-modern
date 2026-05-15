import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.datavault.app',
  appName: 'data-vault',
  webDir: 'out',
  server: {
    url: 'https://dmrv-platform.com', // Resolves Localhost trap
    cleartext: true
  }
};

export default config;
