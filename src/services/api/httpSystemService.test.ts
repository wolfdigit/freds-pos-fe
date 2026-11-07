import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpSystemService } from './httpSystemService';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('oauth account HTTP CRUD', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    window.__APP_CONFIG__ = {
      USE_MOCK: false,
      API_BASE_URL: 'http://pos.test/api/v1',
      GOOGLE_CLIENT_ID: 'test-client',
    };
  });

  it('uses the backend account routes and surfaces 409 guard messages', async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calls.push({ url, init });
        if (init?.method === 'DELETE') {
          return json({ code: 'ACCOUNT_LAST_ADMIN', message: '至少要保留一位管理員' }, 409);
        }
        if (init?.method === 'PUT') {
          return json({ id: 'acct-1', email: 'person@example.com', role: 'staff', name: '新名稱', note: '早班' });
        }
        if (init?.method === 'POST') {
          return json({ id: 'acct-2', email: 'new@example.com', role: 'staff', name: '新同事', note: null }, 201);
        }
        return json([{ id: 'acct-1', email: 'person@example.com', role: 'admin', name: '人員', note: null }]);
      })
    );

    const service = new HttpSystemService();
    const listed = await service.listAccounts();
    expect(listed[0]?.id).toBe('acct-1');
    await service.createAccount({ email: 'new@example.com', role: 'staff', name: '新同事', note: null });
    await service.updateAccount('person@example.com', { role: 'staff', name: '新名稱', note: '早班' });
    await expect(service.deleteAccount('person@example.com')).rejects.toThrow('至少要保留一位管理員');

    expect(calls.map((call) => call.url)).toEqual([
      'http://pos.test/api/v1/system/oauth/accounts',
      'http://pos.test/api/v1/system/oauth/accounts',
      'http://pos.test/api/v1/system/oauth/accounts/person%40example.com',
      'http://pos.test/api/v1/system/oauth/accounts/person%40example.com',
    ]);
    for (const call of calls) {
      expect(new Headers(call.init?.headers).get('authorization')).toBe('Bearer pos-session');
    }
    expect(calls.some((call) => String(call.init?.body).includes('client_secret'))).toBe(false);
  });
});
