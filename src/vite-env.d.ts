/// <reference types="vite/client" />

export interface AppRuntimeConfig {
  USE_MOCK: boolean;
  API_BASE_URL: string;
  API_TIMEOUT_MS?: number;
}

declare global {
  interface Window {
    __APP_CONFIG__?: AppRuntimeConfig;
  }
}
