import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { locationService, productService, systemService } from '@/services';
import { INITIAL_STORES } from '@/services/mock/mockDataSeed';
import { setStoredStores } from '@/services/mock/storageHelper';
import { useSessionStore } from '@/store/sessionStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { SettingsPage } from './SettingsPage';

describe('settings page requests', () => {
  beforeEach(() => {
    setStoredStores(INITIAL_STORES.map((store) => ({ ...store })));
    useToastStore.setState({ toasts: [] });
    useSessionStore.setState({
      userRole: 'admin',
      storeName: '奇可門市',
      stores: ['奇可門市', '線上網購'],
      oauthUser: { id: 'acct-admin', name: '管理員', email: 'owner@example.com', role: 'admin' },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads locations, store records and the stock summary once on open, without the product list', async () => {
    const getLocations = vi.spyOn(locationService, 'getLocations');
    const getStores = vi.spyOn(systemService, 'getStores');
    const getStockSummary = vi.spyOn(locationService, 'getStockSummary').mockResolvedValue([]);
    const searchProducts = vi.spyOn(productService, 'searchProducts');
    const searchProductPage = vi.spyOn(productService, 'searchProductPage');

    render(<SettingsPage />);
    expect(await screen.findByText('後方倉庫')).toBeInTheDocument();
    await waitFor(() => expect(getStores).toHaveBeenCalled());

    // 同一份門市名單換了新陣列，不應再抓一次門市資料。
    useSessionStore.setState({ stores: ['奇可門市', '線上網購'] });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(getLocations).toHaveBeenCalledTimes(1);
    expect(getStores).toHaveBeenCalledTimes(1);
    expect(getStockSummary).toHaveBeenCalledTimes(1);
    expect(searchProducts).not.toHaveBeenCalled();
    expect(searchProductPage).not.toHaveBeenCalled();
  });

  it('shows the per-location totals from the stock summary', async () => {
    const locations = await locationService.getLocations();
    const warehouse = locations.find((row) => row.name === '後方倉庫')!;
    vi.spyOn(locationService, 'getStockSummary').mockResolvedValue(
      locations.map((row) => ({
        locationId: row.id,
        locationName: row.name,
        totalQuantity: row.id === warehouse.id ? 37 : 0,
        productCount: row.id === warehouse.id ? 4 : 0,
        hasNonZeroStock: row.id === warehouse.id,
      }))
    );
    render(<SettingsPage />);
    expect(await screen.findByText('37 台')).toBeInTheDocument();
    expect(screen.getByText('4 項現貨商品')).toBeInTheDocument();
  });

  it('shows the location table before the product totals finish loading', async () => {
    vi.spyOn(locationService, 'getStockSummary').mockReturnValue(new Promise(() => undefined));
    render(<SettingsPage />);
    expect(await screen.findByText('後方倉庫')).toBeInTheDocument();
    expect(screen.getAllByText('讀取中').length).toBeGreaterThan(0);
  });

  it('refetches store records when the store list really changes', async () => {
    const getStores = vi.spyOn(systemService, 'getStores');
    vi.spyOn(locationService, 'getStockSummary').mockResolvedValue([]);
    render(<SettingsPage />);
    await waitFor(() => expect(getStores).toHaveBeenCalledTimes(1));

    useSessionStore.setState({ stores: ['奇可門市', '線上網購', '新門市'] });
    await waitFor(() => expect(getStores).toHaveBeenCalledTimes(2));
    expect(getStores).toHaveBeenLastCalledWith({ fresh: true });
  });
});
