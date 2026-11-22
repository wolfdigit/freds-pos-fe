import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { locationService } from '@/services';
import { INITIAL_STORES } from '@/services/mock/mockDataSeed';
import { setStoredStores } from '@/services/mock/storageHelper';
import { useSessionStore } from '@/store/sessionStore';
import { useToastStore } from '@/components/feedback/toastStore';
import type { InventoryLocationDto } from '@/types/inventory';
import { SettingsPage } from './SettingsPage';

function row(id: string, name: string, displayOrder: number): InventoryLocationDto {
  return { id, name, icon: '📍', displayOrder, storeNames: [], returnedStoreNames: [], preorderStoreNames: [] };
}

describe('settings location list display', () => {
  beforeEach(() => {
    setStoredStores(INITIAL_STORES.map((store) => ({ ...store })));
    useToastStore.setState({ toasts: [] });
    useSessionStore.setState({
      userRole: 'admin',
      storeName: '奇可門市',
      stores: ['奇可門市', '線上網購'],
      oauthUser: { id: 'acct-admin', name: '管理員', email: 'owner@example.com', role: 'admin' },
    });
    vi.spyOn(locationService, 'getStockSummary').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('numbers rows by position even when two locations share a sort weight', async () => {
    vi.spyOn(locationService, 'getLocations').mockResolvedValue([
      row('a', '門市現貨', 1),
      row('b', 'QA測試據點', 1),
      row('c', '後方倉庫', 2),
    ]);
    render(<SettingsPage />);
    await screen.findByText('QA測試據點');
    const rows = screen.getAllByRole('row').slice(1);
    expect(rows.map((tr) => within(tr).getAllByRole('cell')[0]?.textContent)).toEqual(['#1', '#2', '#3']);
    expect(within(rows[1]!).getAllByRole('cell')[0]).toHaveAttribute('title', '排序權重 1');
  });

  it('shows 讀取中 instead of 0 for the location count until locations load', async () => {
    let resolve: (rows: InventoryLocationDto[]) => void = () => {};
    vi.spyOn(locationService, 'getLocations').mockReturnValue(new Promise((r) => { resolve = r; }));
    render(<SettingsPage />);
    const count = screen.getByText(/據點總數/);
    expect(count.textContent).toContain('讀取中');
    expect(count.textContent).not.toMatch(/據點總數:\s*0/);
    resolve([row('a', '門市現貨', 1)]);
    expect(await screen.findByText('門市現貨')).toBeInTheDocument();
    expect(screen.getByText(/據點總數/).textContent).toMatch(/據點總數:\s*1 個/);
  });
});
