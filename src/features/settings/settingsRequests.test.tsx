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

  it('loads locations, store records and products once on open', async () => {
    const getLocations = vi.spyOn(locationService, 'getLocations');
    const getStores = vi.spyOn(systemService, 'getStores');
    const searchProducts = vi.spyOn(productService, 'searchProducts').mockResolvedValue([]);

    render(<SettingsPage />);
    expect(await screen.findByText('後方倉庫')).toBeInTheDocument();
    await waitFor(() => expect(getStores).toHaveBeenCalled());

    // 同一份門市名單換了新陣列，不應再抓一次門市資料。
    useSessionStore.setState({ stores: ['奇可門市', '線上網購'] });
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(getLocations).toHaveBeenCalledTimes(1);
    expect(getStores).toHaveBeenCalledTimes(1);
    expect(searchProducts).toHaveBeenCalledTimes(1);
  });

  it('shows the location table before the product totals finish loading', async () => {
    vi.spyOn(productService, 'searchProducts').mockReturnValue(new Promise(() => undefined));
    render(<SettingsPage />);
    expect(await screen.findByText('後方倉庫')).toBeInTheDocument();
    expect(screen.getAllByText('讀取中').length).toBeGreaterThan(0);
  });

  it('refetches store records when the store list really changes', async () => {
    const getStores = vi.spyOn(systemService, 'getStores');
    vi.spyOn(productService, 'searchProducts').mockResolvedValue([]);
    render(<SettingsPage />);
    await waitFor(() => expect(getStores).toHaveBeenCalledTimes(1));

    useSessionStore.setState({ stores: ['奇可門市', '線上網購', '新門市'] });
    await waitFor(() => expect(getStores).toHaveBeenCalledTimes(2));
    expect(getStores).toHaveBeenLastCalledWith({ fresh: true });
  });
});
