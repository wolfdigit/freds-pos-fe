export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthState {
  expiresAt: string;
  storeSelected: boolean;
  storeName: string | null;
  user: AuthUser;
}

export interface AuthLoginState extends AuthState {
  token: string;
  tokenType: string;
}

export interface LogoutResult {
  loggedOut: boolean;
}

export interface SelectStoreRequest {
  storeName: string;
}
