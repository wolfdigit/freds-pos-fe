import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('@/auth/googleIdentity', () => ({
  loadGoogleIdentityScript: vi.fn().mockResolvedValue(undefined),
  renderGoogleButton: vi.fn(),
}));

const liveConfig = {
  USE_MOCK: false,
  API_BASE_URL: 'http://pos.test/api/v1',
  API_TIMEOUT_MS: 5000,
  GOOGLE_CLIENT_ID: 'test-client.apps.googleusercontent.com',
};

window.__APP_CONFIG__ = liveConfig;

const staff = { id: 'acct-s', email: 's@example.com', name: '店員', role: 'staff' };

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function deferred<T>() {
  let resolve: (value: T) => void = () => undefined;
  const promise = new Promise<T>((r) => {
    resolve = r;
  });
  return { promise, resolve };
}

describe('session restore fetches /auth/me and /auth/stores in parallel', () => {
  beforeEach(async () => {
    localStorage.clear();
    window.__APP_CONFIG__ = liveConfig;
    const { resetAuthForTests } = await import('@/store/authStore');
    const { useSessionStore } = await import('@/store/sessionStore');
    resetAuthForTests();
    useSessionStore.getState().clearIdentity();
  });

  it('sends /auth/stores before /auth/me answers and reuses it instead of a second request', async () => {
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    const me = deferred<Response>();
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        calls.push(new URL(url).pathname);
        if (url.endsWith('/auth/me')) return me.promise;
        if (url.endsWith('/auth/stores')) return json([{ name: '奇可門市' }, { name: '線上網購' }]);
        return json({ code: 'NOT_FOUND', message: '未預期的請求' }, 404);
      })
    );
    const { AuthGate } = await import('@/features/auth/AuthGate');
    const { useSessionStore } = await import('@/store/sessionStore');

    render(
      <AuthGate>
        <div>業務櫃檯</div>
      </AuthGate>
    );

    await waitFor(() => expect(calls).toContain('/api/v1/auth/stores'));
    expect(calls).toContain('/api/v1/auth/me');
    // /auth/me 還沒回來前不能進入業務畫面，也不能先套用門市清單。
    expect(screen.queryByText('業務櫃檯')).not.toBeInTheDocument();
    expect(useSessionStore.getState().stores).toEqual([]);

    me.resolve(
      json({
        expiresAt: '2099-01-01T00:00:00.000Z',
        storeSelected: true,
        storeName: '奇可門市',
        user: staff,
      })
    );

    expect(await screen.findByText('業務櫃檯')).toBeInTheDocument();
    await waitFor(() => expect(useSessionStore.getState().stores).toEqual(['奇可門市', '線上網購']));
    expect(calls.filter((path) => path.endsWith('/auth/stores'))).toHaveLength(1);
    vi.unstubAllGlobals();
  });

  it('drops the prefetched stores and signs out when /auth/me returns 401', async () => {
    localStorage.setItem('AUTH_TOKEN', 'expired');
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/auth/me')) {
          return json({ code: 'AUTH_SESSION_EXPIRED', message: '登入已過期' }, 401);
        }
        if (url.endsWith('/auth/stores')) {
          return json({ code: 'AUTH_SESSION_EXPIRED', message: '登入已過期' }, 401);
        }
        return json({ code: 'NOT_FOUND', message: '未預期的請求' }, 404);
      })
    );
    const { AuthGate } = await import('@/features/auth/AuthGate');
    const { useSessionStore } = await import('@/store/sessionStore');
    const { takeLoginStoresPrefetch } = await import('@/auth/storePrefetch');

    render(
      <AuthGate>
        <div>業務櫃檯</div>
      </AuthGate>
    );

    expect(await screen.findByRole('heading', { name: '使用 Google 帳號登入' })).toBeInTheDocument();
    expect(screen.queryByText('業務櫃檯')).not.toBeInTheDocument();
    expect(localStorage.getItem('AUTH_TOKEN')).toBeNull();
    expect(useSessionStore.getState().stores).toEqual([]);
    expect(takeLoginStoresPrefetch()).toBeNull();
    vi.unstubAllGlobals();
  });

  it('does not reuse a prefetch made with another token', async () => {
    localStorage.setItem('AUTH_TOKEN', 'token-a');
    const fetchMock = vi.fn(async () => json([{ name: '奇可門市' }]));
    vi.stubGlobal('fetch', fetchMock);
    const { prefetchLoginStores, takeLoginStoresPrefetch } = await import('@/auth/storePrefetch');

    prefetchLoginStores();
    localStorage.setItem('AUTH_TOKEN', 'token-b');
    expect(takeLoginStoresPrefetch()).toBeNull();
    vi.unstubAllGlobals();
  });
});
