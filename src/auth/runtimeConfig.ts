export const AUTH_TOKEN_KEY = 'AUTH_TOKEN';

export const MISSING_GOOGLE_CLIENT_MESSAGE =
  'Google 登入尚未設定。請在部署環境設定 GOOGLE_CLIENT_ID（或 VITE_GOOGLE_CLIENT_ID），重新產生 public/config.js 後再開啟。沒有這個值時，業務畫面與購物車都會保持關閉。後端也必須設定同一個 GOOGLE_CLIENT_ID。';

export function readGoogleClientId(): string {
  return window.__APP_CONFIG__?.GOOGLE_CLIENT_ID?.trim() ?? '';
}

export function readAuthToken(): string | null {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return token && token.trim() ? token : null;
}

export function writeAuthToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
