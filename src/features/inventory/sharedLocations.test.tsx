import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';

const liveConfig = {
  USE_MOCK: false,
  API_BASE_URL: 'http://pos.test/api/v1',
  API_TIMEOUT_MS: 5000,
  GOOGLE_CLIENT_ID: 'test-client',
};

window.__APP_CONFIG__ = liveConfig;

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

const location = { id: 'loc-1', name: '門市現貨', displayOrder: 1, storeNames: ['奇可門市'], returnedStoreNames: [] };

describe('shared /inventory/locations', () => {
  const calls: string[] = [];

  beforeEach(async () => {
    calls.length = 0;
    localStorage.clear();
    localStorage.setItem('AUTH_TOKEN', 'pos-session');
    window.__APP_CONFIG__ = liveConfig;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = new URL(String(input));
        calls.push(`${init?.method ?? 'GET'} ${url.pathname}`);
        if (url.pathname.endsWith('/inventory/locations') && (init?.method ?? 'GET') === 'GET') {
          return json([location]);
        }
        if (url.pathname.includes('/system/stores') && (init?.method ?? 'GET') === 'GET') return json([]);
        return json({ ok: true });
      })
    );
    const { invalidateStoreAndLocationCaches } = await import('@/services/api/sharedCaches');
    invalidateStoreAndLocationCaches();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const locationReads = () => calls.filter((call) => call === 'GET /api/v1/inventory/locations').length;

  it('loads once when several components on one page mount useLocations', async () => {
    const { useLocations } = await import('./hooks/useLocations');
    function Probe({ label }: { label: string }) {
      const { locations } = useLocations();
      return <div>{`${label}:${locations.length}`}</div>;
    }
    const view = render(
      <>
        <Probe label="page" />
        <Probe label="table" />
        <Probe label="modal" />
      </>
    );
    await waitFor(() => expect(view.getByText('modal:1')).toBeInTheDocument());
    expect(view.getByText('page:1')).toBeInTheDocument();
    expect(locationReads()).toBe(1);

    // 換頁再掛載，短時間內仍共用。
    view.unmount();
    const again = render(<Probe label="customers" />);
    await waitFor(() => expect(again.getByText('customers:1')).toBeInTheDocument());
    expect(locationReads()).toBe(1);
  });

  it('refetches on refresh, after the TTL, and after any store or location write', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    const { locationService, systemService } = await import('@/services');
    const { LOCATIONS_TTL_MS } = await import('@/services/api/sharedCaches');
    const { invalidateLocationCatalog } = await import('./locationCatalog');

    await locationService.getLocations();
    await locationService.getLocations();
    expect(locationReads()).toBe(1);

    await locationService.getLocations({ fresh: true });
    expect(locationReads()).toBe(2);

    vi.setSystemTime(Date.now() + LOCATIONS_TTL_MS + 1);
    await locationService.getLocations();
    expect(locationReads()).toBe(3);

    await locationService.updateLocation('loc-1', { name: '新名稱' });
    await locationService.getLocations();
    expect(locationReads()).toBe(4);

    await systemService.rebindStore('奇可門市', { inventoryLocationId: 'loc-1', returnedInventoryLocationId: 'loc-1' });
    await locationService.getLocations();
    expect(locationReads()).toBe(5);

    invalidateLocationCatalog();
    await locationService.getLocations();
    expect(locationReads()).toBe(6);
  });

  it('gives each caller its own copy', async () => {
    const { locationService } = await import('@/services');
    const [a, b] = await Promise.all([locationService.getLocations(), locationService.getLocations()]);
    a[0].storeNames.push('改過');
    expect(b[0].storeNames).toEqual(['奇可門市']);
    expect(locationReads()).toBe(1);
  });
});
