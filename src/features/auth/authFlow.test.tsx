import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

const admin = {
  id: 'acct-a',
  email: 'a@example.com',
  name: '人員 A',
  role: 'admin',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('live Google session', () => {
  beforeEach(async () => {
    localStorage.clear();
    window.__APP_CONFIG__ = liveConfig;
    const { resetAuthForTests } = await import('@/store/authStore');
    const { bindCartToUser } = await import('@/auth/cartPersistence');
    const { renderGoogleButton } = await import('@/auth/googleIdentity');
    resetAuthForTests();
    bindCartToUser(null);
    vi.mocked(renderGoogleButton).mockClear();
  });

  it('keeps the business UI and cart closed until login and store selection', async () => {
    const savedCart = {
      items: [{ productId: 'p1', quantity: 2, name: '模型' }],
      attachedCustomer: { id: 'c1', name: '會員' },
      shippingFee: 30,
      orderNote: '保留',
    };
    localStorage.setItem('FREDS_POS_CART:acct-a', JSON.stringify(savedCart));
    localStorage.setItem('FREDS_POS_CART', '{"items":[{"productId":"legacy"}]}');
    const { AuthGate } = await import('@/features/auth/AuthGate');
    const { clearLegacyUnownedCart } = await import('@/auth/cartPersistence');
    clearLegacyUnownedCart();

    render(
      <AuthGate>
        <div>業務櫃檯</div>
      </AuthGate>
    );

    expect(await screen.findByRole('heading', { name: '使用 Google 帳號登入' })).toBeInTheDocument();
    expect(screen.queryByText('業務櫃檯')).not.toBeInTheDocument();
    expect(localStorage.getItem('FREDS_POS_CART')).toBeNull();
    expect(localStorage.getItem('FREDS_POS_CART:acct-a')).toContain('保留');
  });

  it('fails closed when the Google client id is missing', async () => {
    window.__APP_CONFIG__ = { ...liveConfig, GOOGLE_CLIENT_ID: '' };
    const { AuthGate } = await import('@/features/auth/AuthGate');
    render(
      <AuthGate>
        <div>業務櫃檯</div>
      </AuthGate>
    );
    expect(await screen.findByRole('heading', { name: 'Google 登入尚未設定' })).toBeInTheDocument();
    expect(screen.getByText(/GOOGLE_CLIENT_ID/)).toBeInTheDocument();
    expect(screen.queryByText('業務櫃檯')).not.toBeInTheDocument();
  });

  it('sends only the Google credential, then selects a store without clearing the account cart', async () => {
    const user = userEvent.setup();
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push({ url, init });
        if (url.endsWith('/auth/google')) {
          return json({
            token: 'pos-session',
            tokenType: 'Bearer',
            expiresAt: '2099-01-01T00:00:00.000Z',
            storeSelected: false,
            storeName: null,
            user: admin,
          });
        }
        if (url.endsWith('/auth/stores')) return json([{ name: '奇可門市', isDefault: true }]);
        if (url.endsWith('/auth/store')) {
          return json({
            expiresAt: '2099-01-01T00:00:00.000Z',
            storeSelected: true,
            storeName: '奇可門市',
            user: admin,
          });
        }
        if (url.endsWith('/auth/me')) {
          return json({
            expiresAt: '2099-01-01T00:00:00.000Z',
            storeSelected: true,
            storeName: '奇可門市',
            user: admin,
          });
        }
        return json({ code: 'NOT_FOUND', message: '未預期的請求' }, 404);
      })
    );

    localStorage.setItem(
      'FREDS_POS_CART:acct-a',
      JSON.stringify({
        items: [{ productId: 'p1', quantity: 2 }],
        attachedCustomer: null,
        shippingFee: 15,
        orderNote: '跨次保留',
      })
    );

    const { AuthGate } = await import('@/features/auth/AuthGate');
    const { renderGoogleButton } = await import('@/auth/googleIdentity');
    const { useCartStore } = await import('@/store/cartStore');

    function Probe() {
      const count = useCartStore((state) => state.items.length);
      const note = useCartStore((state) => state.orderNote);
      return <div>{`業務櫃檯 ${count} ${note}`}</div>;
    }

    render(
      <AuthGate>
        <Probe />
      </AuthGate>
    );
    expect(await screen.findByRole('heading', { name: '使用 Google 帳號登入' })).toBeInTheDocument();

    await waitFor(() => expect(vi.mocked(renderGoogleButton).mock.calls.length).toBeGreaterThan(0));
    const onCredential = vi.mocked(renderGoogleButton).mock.calls.at(-1)?.[2];
    if (!onCredential) throw new Error('Google button was not rendered');
    onCredential('google-id-token');

    expect(await screen.findByRole('heading', { name: '選擇登入門市' })).toBeInTheDocument();
    expect(screen.queryByText(/業務櫃檯/)).not.toBeInTheDocument();
    const loginCall = calls.find((call) => call.url.endsWith('/auth/google'));
    expect(JSON.parse(String(loginCall?.init?.body))).toEqual({ credential: 'google-id-token' });
    expect(loginCall?.init?.credentials).not.toBe('include');
    expect(localStorage.getItem('AUTH_TOKEN')).toBe('pos-session');

    await user.click(await screen.findByRole('button', { name: /奇可門市/ }));
    expect(await screen.findByText('業務櫃檯 1 跨次保留')).toBeInTheDocument();
    const selectCall = calls.find((call) => call.url.endsWith('/auth/store'));
    expect(JSON.parse(String(selectCall?.init?.body))).toEqual({ storeName: '奇可門市' });
    const authorization = new Headers(selectCall?.init?.headers).get('authorization');
    expect(authorization).toBe('Bearer pos-session');
    expect(localStorage.getItem('FREDS_POS_CART:acct-a')).toContain('跨次保留');
  });

  it('logs out only this token and keeps the account cart', async () => {
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    localStorage.setItem(
      'FREDS_POS_CART:acct-a',
      JSON.stringify({ items: [{ productId: 'p1', quantity: 2 }], attachedCustomer: null, shippingFee: 0, orderNote: '留下' })
    );
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        if (url.endsWith('/auth/me')) {
          return json({
            expiresAt: '2099-01-01T00:00:00.000Z',
            storeSelected: true,
            storeName: '奇可門市',
            user: admin,
          });
        }
        if (url.endsWith('/auth/logout')) return json({ loggedOut: true });
        return json({ code: 'NOT_FOUND', message: String(init?.method) }, 404);
      })
    );
    const { useAuthStore } = await import('@/store/authStore');
    const { useCartStore } = await import('@/store/cartStore');
    await useAuthStore.getState().restore();
    expect(useAuthStore.getState().phase).toBe('ready');
    expect(useCartStore.getState().orderNote).toBe('留下');

    await useAuthStore.getState().logout();
    expect(localStorage.getItem('AUTH_TOKEN')).toBeNull();
    expect(useAuthStore.getState().phase).toBe('anonymous');
    expect(useCartStore.getState().items).toEqual([]);
    expect(localStorage.getItem('FREDS_POS_CART:acct-a')).toContain('留下');
  });

  it('clears login on expiry without deleting the cart, and shares sign-out across tabs', async () => {
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    localStorage.setItem('FREDS_POS_CART:acct-a', JSON.stringify({ items: [{ productId: 'p1' }], attachedCustomer: null, shippingFee: 0, orderNote: '過期仍在' }));
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).endsWith('/auth/me')) {
          return json({ code: 'AUTH_SESSION_EXPIRED', message: '登入已過期' }, 401);
        }
        return json({ loggedOut: true });
      })
    );
    const { AuthGate } = await import('@/features/auth/AuthGate');
    render(
      <AuthGate>
        <div>業務櫃檯</div>
      </AuthGate>
    );
    expect(await screen.findByRole('heading', { name: '使用 Google 帳號登入' })).toBeInTheDocument();
    expect(screen.queryByText('業務櫃檯')).not.toBeInTheDocument();
    expect(localStorage.getItem('AUTH_TOKEN')).toBeNull();
    expect(localStorage.getItem('FREDS_POS_CART:acct-a')).toContain('過期仍在');
  });

  it('switches identity from another tab without showing the previous cart', async () => {
    localStorage.setItem('AUTH_TOKEN', 'token-a');
    localStorage.setItem('FREDS_POS_CART:acct-a', JSON.stringify({ items: [{ productId: 'a', quantity: 2 }], attachedCustomer: null, shippingFee: 0, orderNote: 'A' }));
    localStorage.setItem('FREDS_POS_CART:acct-b', JSON.stringify({ items: [{ productId: 'b', quantity: 1 }], attachedCustomer: null, shippingFee: 0, orderNote: 'B' }));
    let active = admin;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        if (String(input).endsWith('/auth/me')) {
          return json({
            expiresAt: '2099-01-01T00:00:00.000Z',
            storeSelected: true,
            storeName: '奇可門市',
            user: active,
          });
        }
        return json({ code: 'NOT_FOUND', message: 'no' }, 404);
      })
    );
    const { startAuthRuntime, useAuthStore } = await import('@/store/authStore');
    const { useCartStore } = await import('@/store/cartStore');
    const stop = startAuthRuntime();
    await useAuthStore.getState().restore();
    expect(useCartStore.getState().orderNote).toBe('A');

    active = { id: 'acct-b', email: 'b@example.com', name: '人員 B', role: 'staff' };
    localStorage.setItem('AUTH_TOKEN', 'token-b');
    window.dispatchEvent(new StorageEvent('storage', { key: 'AUTH_TOKEN', oldValue: 'token-a', newValue: 'token-b' }));
    expect(useCartStore.getState().items).toEqual([]);
    await waitFor(() => expect(useAuthStore.getState().user?.id).toBe('acct-b'));
    expect(useCartStore.getState().orderNote).toBe('B');
    expect(localStorage.getItem('FREDS_POS_CART:acct-a')).toContain('"A"');
    stop();
  });

  it('keeps the session on forbidden and store-required responses', async () => {
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    let role = 'admin';
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/auth/me')) {
          return json({
            expiresAt: '2099-01-01T00:00:00.000Z',
            storeSelected: true,
            storeName: '奇可門市',
            user: { ...admin, role },
          });
        }
        if (url.endsWith('/system/oauth/accounts')) {
          return json({ code: 'AUTH_FORBIDDEN', message: '需要管理員權限' }, 403);
        }
        if (url.endsWith('/products')) {
          return json({ code: 'AUTH_STORE_REQUIRED', message: '請先選擇門市' }, 403);
        }
        return json({ code: 'NOT_FOUND', message: 'no' }, 404);
      })
    );
    const { startAuthRuntime, useAuthStore } = await import('@/store/authStore');
    const { httpClient } = await import('@/services/api/httpClient');
    const stop = startAuthRuntime();
    await useAuthStore.getState().restore();
    role = 'staff';
    await expect(httpClient.get('/system/oauth/accounts')).rejects.toThrow('需要管理員權限');
    await waitFor(() => expect(useAuthStore.getState().user?.role).toBe('staff'));
    const { hasPermission } = await import('@/auth/permissions');
    expect(hasPermission(useAuthStore.getState().user?.role, 'store.manage')).toBe(false);
    expect(hasPermission(useAuthStore.getState().user?.role, 'store.select')).toBe(true);
    expect(hasPermission(useAuthStore.getState().user?.role, 'whitelist.manage')).toBe(false);
    expect(localStorage.getItem('AUTH_TOKEN')).toBe('pos-session');
    expect(useAuthStore.getState().phase).toBe('ready');

    await expect(httpClient.get('/products')).rejects.toThrow('請先選擇門市');
    expect(useAuthStore.getState().phase).toBe('needs-store');
    expect(localStorage.getItem('AUTH_TOKEN')).toBe('pos-session');
    stop();
  });

  it('lets staff switch the login store through the auth endpoint', async () => {
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    localStorage.setItem(
      'FREDS_POS_CART:acct-staff',
      JSON.stringify({ items: [{ productId: 'p1', quantity: 1 }], attachedCustomer: null, shippingFee: 0, orderNote: '留下' })
    );
    const staff = { id: 'acct-staff', email: 'clerk@example.com', name: '店員', role: 'staff' };
    const calls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push(`${init?.method ?? 'GET'} ${url}`);
        if (url.endsWith('/auth/me') || url.endsWith('/auth/store')) {
          const storeName = url.endsWith('/auth/store') ? '官網' : '奇可門市';
          return json({
            expiresAt: '2099-01-01T00:00:00.000Z',
            storeSelected: true,
            storeName,
            user: staff,
          });
        }
        if (url.endsWith('/auth/stores')) {
          return json([
            { name: '奇可門市', isDefault: true },
            { name: '官網', isDefault: false },
          ]);
        }
        if (url.includes('/system/stores')) {
          return json({ code: 'AUTH_FORBIDDEN', message: '需要管理員權限' }, 403);
        }
        return json({ code: 'NOT_FOUND', message: 'no' }, 404);
      })
    );
    const { useAuthStore, switchLoginStore } = await import('@/store/authStore');
    const { useSessionStore } = await import('@/store/sessionStore');
    const { useCartStore } = await import('@/store/cartStore');
    await useAuthStore.getState().restore();
    await useSessionStore.getState().fetchStores();
    expect(useCartStore.getState().orderNote).toBe('留下');
    const result = await switchLoginStore('官網');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.cartItemCount).toBe(1);
    expect(useAuthStore.getState().storeName).toBe('官網');
    expect(useCartStore.getState().orderNote).toBe('留下');
    expect(calls.some((call) => call.startsWith('GET') && call.includes('/auth/stores'))).toBe(true);
    expect(calls.some((call) => call.startsWith('POST') && call.endsWith('/auth/store'))).toBe(true);
    expect(calls.some((call) => call.includes('/system/stores'))).toBe(false);
  });

  it('shows every auth store for a signed-in staff member, including after a one-store session restore', async () => {
    const user = userEvent.setup();
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    localStorage.setItem(
      'FREDS_POS_SESSION',
      JSON.stringify({
        state: { storeName: '台北旗艦店', stores: ['台北旗艦店'] },
        version: 3,
      })
    );
    localStorage.setItem(
      'FREDS_POS_CART:acct-staff',
      JSON.stringify({
        items: [{ productId: 'p1', quantity: 1 }],
        attachedCustomer: null,
        shippingFee: 0,
        orderNote: '留下',
      })
    );
    const staff = { id: 'acct-staff', email: 'clerk@example.com', name: '店員', role: 'staff' };
    const calls: string[] = [];
    vi.resetModules();
    window.__APP_CONFIG__ = liveConfig;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push(`${init?.method ?? 'GET'} ${url}`);
        if (url.endsWith('/auth/me')) {
          return json({
            expiresAt: '2099-01-01T00:00:00.000Z',
            storeSelected: true,
            storeName: '台北旗艦店',
            user: staff,
          });
        }
        if (url.endsWith('/auth/stores')) {
          return json([
            { name: '台北旗艦店', isDefault: true },
            { name: '奇可門市', isDefault: false },
            { name: '官網', isDefault: false },
          ]);
        }
        if (url.endsWith('/auth/store')) {
          return json({
            expiresAt: '2099-01-01T00:00:00.000Z',
            storeSelected: true,
            storeName: '官網',
            user: staff,
          });
        }
        if (url.includes('/system/stores')) {
          return json({ code: 'AUTH_FORBIDDEN', message: '需要管理員權限' }, 403);
        }
        return json({ code: 'NOT_FOUND', message: 'no' }, 404);
      })
    );

    const { useSessionStore } = await import('@/store/sessionStore');
    const { useAuthStore } = await import('@/store/authStore');
    const { useCartStore } = await import('@/store/cartStore');
    const { Header } = await import('@/components/layout/Header');
    await useSessionStore.persist.rehydrate();
    expect(useSessionStore.getState().stores).toEqual([]);

    await useAuthStore.getState().restore();
    render(<Header />);

    expect(await screen.findByRole('option', { name: '台北旗艦店' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '奇可門市' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '官網' })).toBeInTheDocument();
    expect(calls.some((call) => call.startsWith('GET') && call.includes('/auth/stores'))).toBe(true);
    expect(calls.some((call) => call.includes('/system/stores'))).toBe(false);
    expect(useCartStore.getState().orderNote).toBe('留下');

    await user.selectOptions(screen.getByRole('combobox', { name: '登入門市' }), '官網');
    await waitFor(() => expect(useSessionStore.getState().storeName).toBe('官網'));
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().orderNote).toBe('留下');
    expect(calls.some((call) => call.startsWith('POST') && call.endsWith('/auth/store'))).toBe(true);
  });

  it('does not present a failed store list as a single-store dropdown', async () => {
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    localStorage.setItem(
      'FREDS_POS_SESSION',
      JSON.stringify({
        state: { storeName: '台北旗艦店', stores: ['台北旗艦店'] },
        version: 3,
      })
    );
    const staff = { id: 'acct-staff', email: 'clerk@example.com', name: '店員', role: 'staff' };
    vi.resetModules();
    window.__APP_CONFIG__ = liveConfig;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.endsWith('/auth/me')) {
          return json({
            expiresAt: '2099-01-01T00:00:00.000Z',
            storeSelected: true,
            storeName: '台北旗艦店',
            user: staff,
          });
        }
        if (url.endsWith('/auth/stores')) {
          return json({ code: 'AUTH_FORBIDDEN', message: '無法讀取門市清單' }, 403);
        }
        return json({ code: 'NOT_FOUND', message: 'no' }, 404);
      })
    );
    const { useAuthStore } = await import('@/store/authStore');
    const { Header } = await import('@/components/layout/Header');
    await useAuthStore.getState().restore();
    render(<Header />);
    expect(await screen.findByRole('alert')).toHaveTextContent('無法讀取門市清單');
    expect(screen.queryByRole('combobox', { name: '登入門市' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: '台北旗艦店' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重試' })).toBeInTheDocument();
  });

  it('does not trust a stale demo session blob', async () => {
    localStorage.setItem(
      'FREDS_POS_SESSION',
      JSON.stringify({
        state: {
          userRole: 'admin',
          cashierId: 'staff-001',
          cashierName: '店長 Fred',
          storeName: '假門市',
          stores: ['假門市'],
          oauthUser: { id: 'staff-001', email: 'fred@gmail.com', role: 'admin', name: '店長 Fred' },
          adminAccounts: [{ email: 'fred@gmail.com', name: '店長 Fred' }],
        },
        version: 2,
      })
    );
    vi.resetModules();
    window.__APP_CONFIG__ = liveConfig;
    const { useSessionStore } = await import('@/store/sessionStore');
    await useSessionStore.persist.rehydrate();
    expect(useSessionStore.getState().userRole).toBe('');
    expect(useSessionStore.getState().cashierId).toBe('');
    expect(useSessionStore.getState().storeName).toBe('');
    expect(useSessionStore.getState().oauthUser.email).toBe('');
    expect('adminAccounts' in useSessionStore.getState()).toBe(false);
  });
});
