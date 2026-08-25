import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.luxorides.app",
  appName: "Luxorides",
  webDir: "mobile-shell",
  server: {
    url: "https://app.luxorides.com",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
