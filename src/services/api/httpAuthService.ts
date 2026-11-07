import type { StoreDto } from '@/types/system';
import type { AuthLoginState, AuthState, LogoutResult } from '@/types/auth';
import { httpClient } from './httpClient';

const authRequest = { silentToast: true, skipAuthHandler: true } as const;

export const authApi = {
  login(credential: string): Promise<AuthLoginState> {
    return httpClient.post<AuthLoginState>('/auth/google', { credential }, authRequest);
  },

  me(): Promise<AuthState> {
    return httpClient.get<AuthState>('/auth/me', authRequest);
  },

  listStores(): Promise<StoreDto[]> {
    return httpClient.get<StoreDto[]>('/auth/stores', authRequest).then((data) => data || []);
  },

  selectStore(storeName: string): Promise<AuthState> {
    return httpClient.post<AuthState>('/auth/store', { storeName }, authRequest);
  },

  logout(): Promise<LogoutResult> {
    return httpClient.post<LogoutResult>('/auth/logout', {}, authRequest);
  },
};
