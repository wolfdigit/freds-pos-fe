import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useToastStore } from '@/components/feedback/toastStore';
import { HttpProductService } from './httpProductService';

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('HttpProductService.checkProductAvailability', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    useToastStore.setState({ toasts: [] });
    window.__APP_CONFIG__ = {
      USE_MOCK: false,
      API_BASE_URL: 'http://pos.test/api/v1',
      GOOGLE_CLIENT_ID: 'test-client',
    };
  });

  it('maps backend answers without showing a toast', async () => {
    const urls: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        urls.push(url);
        if (url.endsWith('/products/prod-ok')) return json({ id: 'prod-ok', status: 'active', deleted: false });
        if (url.endsWith('/products/prod-off')) return json({ id: 'prod-off', status: 'deleted', deleted: true });
        if (url.endsWith('/products/prod-gone')) {
          return json({ code: 'PRODUCT_NOT_FOUND', message: '找不到指定的商品' }, 404);
        }
        if (url.endsWith('/products/prod-500')) return json({ code: 'INTERNAL_SERVER_ERROR' }, 500);
        throw new TypeError('Failed to fetch');
      })
    );

    const service = new HttpProductService();
    expect(await service.checkProductAvailability('prod-ok')).toBe('available');
    expect(await service.checkProductAvailability('prod-off')).toBe('delisted');
    expect(await service.checkProductAvailability('prod-gone')).toBe('missing');
    // 伺服器錯誤或斷線不能當成商品不存在。
    expect(await service.checkProductAvailability('prod-500')).toBe('unknown');
    expect(await service.checkProductAvailability('prod-offline')).toBe('unknown');
    expect(urls[0]).toBe('http://pos.test/api/v1/products/prod-ok');
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });
});
