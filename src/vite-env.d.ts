/// <reference types="vite/client" />

export interface AppRuntimeConfig {
  USE_MOCK: boolean;
  API_BASE_URL: string;
  API_TIMEOUT_MS?: number;
  /** Google Identity Services web client id. Empty means login is not configured. */
  GOOGLE_CLIENT_ID?: string;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdentity {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, string | number>) => void;
}

declare global {
  interface Window {
    __APP_CONFIG__?: AppRuntimeConfig;
    google?: {
      accounts: {
        id: GoogleIdentity;
      };
    };
  }
}
