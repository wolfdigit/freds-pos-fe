import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { locationService, productService } from '@/services';
import { INITIAL_STORES } from '@/services/mock/mockDataSeed';
import { setStoredStores } from '@/services/mock/storageHelper';
import { useSessionStore } from '@/store/sessionStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { SettingsPage } from './SettingsPage';

const warehouseId = 'e1a10002-0000-4000-8000-000000000002';

describe('store binding refreshes locations', () => {
  beforeEach(() => {
    setStoredStores(INITIAL_STORES.map((store) => ({ ...store })));
    useToastStore.setState({ toasts: [] });
    useSessionStore.setState({
      userRole: 'admin',
      storeName: '奇可門市',
      stores: ['奇可門市', '線上網購'],
      oauthUser: { id: 'acct-admin', name: '管理員', email: 'owner@example.com', role: 'admin' },
    });
    vi.spyOn(productService, 'searchProducts').mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reloads location bindings after a store is rebound', async () => {
    const user = userEvent.setup();
    const getLocations = vi.spyOn(locationService, 'getLocations');
    render(<SettingsPage />);

    await user.click(await screen.findByRole('button', { name: '門市清單管理' }));
    const storeName = await screen.findByText('奇可門市');
    const storeRow = storeName.closest('div.justify-between');
    if (!(storeRow instanceof HTMLElement)) throw new Error('找不到門市列');
    const callsBeforeRebind = getLocations.mock.calls.length;
    await user.click(within(storeRow).getByRole('button', { name: '改綁' }));

    const dialog = await screen.findByRole('dialog');
    await user.selectOptions(within(dialog).getByRole('combobox', { name: /正常貨庫存點/ }), warehouseId);
    await user.click(within(dialog).getByRole('button', { name: '儲存綁定' }));

    await waitFor(() => expect(getLocations.mock.calls.length).toBeGreaterThan(callsBeforeRebind));
    await user.click(screen.getByRole('button', { name: '庫存據點管理' }));
    await waitFor(() => {
      expect(screen.getByText('後方倉庫').closest('tr')).toHaveTextContent('奇可門市');
    });
  });
});
