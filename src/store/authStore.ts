import { create } from 'zustand';
import { getBoundCartUserId } from '@/auth/cartOwner';
import { bindCartToUser, handleCartStorageEvent } from '@/auth/cartPersistence';
import { errorMessage, isSessionEnd, isSessionEndError } from '@/auth/businessError';
import {
  AUTH_TOKEN_KEY,
  MISSING_GOOGLE_CLIENT_MESSAGE,
  clearAuthToken,
  readAuthToken,
  readGoogleClientId,
  writeAuthToken,
} from '@/auth/runtimeConfig';
import { authApi } from '@/services/api/httpAuthService';
import { subscribeAuthFailure, type AuthFailureNotice } from '@/services/api/httpClient';
import { isMockService } from '@/services';
import type { AuthState, AuthUser } from '@/types/auth';
import { useCartStore } from '@/store/cartStore';
import { useSessionStore } from '@/store/sessionStore';

export type AuthPhase =
  | 'mock'
  | 'loading'
  | 'unconfigured'
  | 'anonymous'
  | 'needs-store'
  | 'ready'
  | 'unreachable';

interface AuthStore {
  phase: AuthPhase;
  user: AuthUser | null;
  expiresAt: string | null;
  storeName: string | null;
  storeSelected: boolean;
  errorMessage: string | null;
  restore: () => Promise<void>;
  loginWithCredential: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  selectStore: (storeName: string) => Promise<void>;
  retry: () => Promise<void>;
}

let generation = 0;
let expiryTimer: number | null = null;

function clearExpiryTimer(): void {
  if (expiryTimer !== null) {
    window.clearTimeout(expiryTimer);
    expiryTimer = null;
  }
}

function endLocalSession(): void {
  generation += 1;
  clearExpiryTimer();
  clearAuthToken();
  bindCartToUser(null);
  useSessionStore.getState().clearIdentity();
  useAuthStore.setState({
    phase: 'anonymous',
    user: null,
    expiresAt: null,
    storeName: null,
    storeSelected: false,
    errorMessage: null,
  });
}

function applyAuthState(state: AuthState): void {
  const phase: AuthPhase = state.storeSelected ? 'ready' : 'needs-store';
  const previousUserId = useAuthStore.getState().user?.id ?? null;
  useSessionStore.getState().applyAuthenticatedUser(state.user, phase === 'ready' ? state.storeName : null);
  if (phase === 'ready') {
    if (getBoundCartUserId() !== state.user.id || previousUserId !== state.user.id) {
      bindCartToUser(state.user.id);
    }
  } else {
    bindCartToUser(null);
  }
  armExpiry(state.expiresAt);
  useAuthStore.setState({
    phase,
    user: state.user,
    expiresAt: state.expiresAt,
    storeName: state.storeName,
    storeSelected: state.storeSelected,
    errorMessage: null,
  });
}

function armExpiry(expiresAt: string): void {
  clearExpiryTimer();
  const ms = Date.parse(expiresAt) - Date.now();
  if (!Number.isFinite(ms)) return;
  // Browsers clamp setTimeout to a 32-bit signed integer. A 12-hour session fits; longer test dates must not overflow into an immediate callback.
  const MAX_TIMEOUT = 2_147_483_647;
  expiryTimer = window.setTimeout(() => {
    void revalidate();
  }, Math.min(Math.max(ms, 0), MAX_TIMEOUT));
}

async function revalidate(): Promise<void> {
  const gen = generation;
  if (!readAuthToken()) return;
  try {
    const me = await authApi.me();
    if (gen !== generation) return;
    applyAuthState(me);
  } catch (err) {
    if (gen !== generation) return;
    if (isSessionEndError(err)) endLocalSession();
  }
}

async function handleTokenStorage(event: StorageEvent): Promise<void> {
  if (isMockService) return;
  generation += 1;
  const gen = generation;
  clearExpiryTimer();
  bindCartToUser(null);
  if (!event.newValue) {
    useSessionStore.getState().clearIdentity();
    useAuthStore.setState({
      phase: 'anonymous',
      user: null,
      expiresAt: null,
      storeName: null,
      storeSelected: false,
      errorMessage: null,
    });
    return;
  }
  useAuthStore.setState({ phase: 'loading', errorMessage: null });
  try {
    const me = await authApi.me();
    if (gen !== generation) return;
    applyAuthState(me);
  } catch (err) {
    if (gen !== generation) return;
    if (isSessionEndError(err)) {
      endLocalSession();
      return;
    }
    useAuthStore.setState({
      phase: 'unreachable',
      user: null,
      errorMessage: '無法向伺服器確認另一個分頁的登入狀態。確認前不會顯示購物車。',
    });
  }
}

export function handleAuthFailure(failure: AuthFailureNotice): void {
  if (isMockService) return;
  if (failure.endpoint.includes('/auth/google')) return;
  if (isSessionEnd(failure.status, failure.code)) {
    endLocalSession();
    return;
  }
  if (failure.status === 403 && failure.code === 'AUTH_STORE_REQUIRED') {
    const user = useAuthStore.getState().user;
    bindCartToUser(null);
    if (user) useSessionStore.getState().applyAuthenticatedUser(user, null);
    useAuthStore.setState({ phase: 'needs-store', storeSelected: false, storeName: null });
    return;
  }
  if (failure.status === 403 && failure.code === 'AUTH_FORBIDDEN') {
    void revalidate();
  }
}

export function startAuthRuntime(): () => void {
  const stopFailure = subscribeAuthFailure(handleAuthFailure);
  const onStorage = (event: StorageEvent) => {
    if (event.key === AUTH_TOKEN_KEY) {
      void handleTokenStorage(event);
      return;
    }
    handleCartStorageEvent(event);
  };
  window.addEventListener('storage', onStorage);
  return () => {
    stopFailure();
    window.removeEventListener('storage', onStorage);
    clearExpiryTimer();
  };
}

export function resetAuthForTests(): void {
  generation += 1;
  clearExpiryTimer();
  useAuthStore.setState({
    phase: isMockService ? 'mock' : 'loading',
    user: null,
    expiresAt: null,
    storeName: null,
    storeSelected: false,
    errorMessage: null,
  });
}

const initialPhase: AuthPhase = isMockService ? 'mock' : 'loading';

export const useAuthStore = create<AuthStore>()(() => ({
  phase: initialPhase,
  user: null,
  expiresAt: null,
  storeName: null,
  storeSelected: false,
  errorMessage: null,

  restore: async () => {
    if (isMockService) {
      useAuthStore.setState({ phase: 'mock', errorMessage: null });
      return;
    }
    const gen = ++generation;
    if (!readGoogleClientId()) {
      clearExpiryTimer();
      bindCartToUser(null);
      useSessionStore.getState().clearIdentity();
      useAuthStore.setState({
        phase: 'unconfigured',
        user: null,
        expiresAt: null,
        storeName: null,
        storeSelected: false,
        errorMessage: MISSING_GOOGLE_CLIENT_MESSAGE,
      });
      return;
    }
    if (!readAuthToken()) {
      clearExpiryTimer();
      bindCartToUser(null);
      useSessionStore.getState().clearIdentity();
      useAuthStore.setState({
        phase: 'anonymous',
        user: null,
        expiresAt: null,
        storeName: null,
        storeSelected: false,
        errorMessage: null,
      });
      return;
    }
    bindCartToUser(null);
    useAuthStore.setState({ phase: 'loading', errorMessage: null });
    try {
      const me = await authApi.me();
      if (gen !== generation) return;
      applyAuthState(me);
    } catch (err) {
      if (gen !== generation) return;
      if (isSessionEndError(err)) {
        endLocalSession();
        return;
      }
      useAuthStore.setState({
        phase: 'unreachable',
        user: null,
        errorMessage: '無法向伺服器確認登入狀態。確認前不會開啟業務畫面或購物車。',
      });
    }
  },

  loginWithCredential: async (credential) => {
    const gen = ++generation;
    const result = await authApi.login(credential);
    if (gen !== generation) return;
    if (!result?.token) {
      throw new Error('登入回應缺少工作階段');
    }
    writeAuthToken(result.token);
    applyAuthState(result);
  },

  logout: async () => {
    const gen = ++generation;
    try {
      await authApi.logout();
    } catch (err) {
      if (gen !== generation) return;
      if (isSessionEndError(err)) {
        endLocalSession();
        return;
      }
      useAuthStore.setState({
        errorMessage: errorMessage(err, '無法連線完成登出。這個裝置的登入仍然有效，請再試一次。'),
      });
      return;
    }
    if (gen !== generation) return;
    endLocalSession();
  },

  selectStore: async (storeName) => {
    const state = await authApi.selectStore(storeName);
    applyAuthState(state);
  },

  retry: async () => {
    await useAuthStore.getState().restore();
  },
}));

export async function switchLoginStore(
  storeName: string
): Promise<{ ok: true; cartItemCount: number } | { ok: false; message: string }> {
  const cartItemCount = useCartStore.getState().items.length;
  if (isMockService) {
    useSessionStore.getState().setStoreName(storeName);
    return { ok: true, cartItemCount };
  }
  try {
    await useAuthStore.getState().selectStore(storeName);
    return { ok: true, cartItemCount };
  } catch (err) {
    return { ok: false, message: errorMessage(err, '無法更換門市') };
  }
}
