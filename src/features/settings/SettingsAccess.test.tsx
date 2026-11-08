import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LEGACY_SHARED_STOCK_LOCATION_ID } from '@/auth/stockLocation';
import { useToastStore } from '@/components/feedback/toastStore';
import { useSessionStore } from '@/store/sessionStore';
import { switchLoginStore } from '@/store/authStore';
import { setStoredStores, STORAGE_KEYS } from '@/services/mock/storageHelper';
import { DeleteLocationModal } from './components/DeleteLocationModal';
import { SettingsPage } from './SettingsPage';

const staff = { id: 'acct-staff', name: '店員', email: 'clerk@example.com', role: 'staff' };
const admin = { id: 'acct-admin', name: '管理員', email: 'owner@example.com', role: 'admin' };

describe('settings access', () => {
  beforeEach(() => {
    useSessionStore.setState({
      userRole: 'staff',
      storeName: '奇可門市',
      stores: ['奇可門市', '官網'],
      oauthUser: staff,
    });
  });

  it('hides store management and user management from staff', async () => {
    render(<SettingsPage />);
    expect(await screen.findByRole('button', { name: '庫存據點管理' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '門市清單管理' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '新增門市' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '儲存對應' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '使用者管理' })).not.toBeInTheDocument();
  });

  it('shows store management to an admin and hides it after a downgrade', async () => {
    const user = userEvent.setup();
    useSessionStore.setState({ userRole: 'admin', oauthUser: admin });
    render(<SettingsPage />);
    await user.click(await screen.findByRole('button', { name: '門市清單管理' }));
    expect(screen.getByRole('button', { name: '新增門市' })).toBeInTheDocument();
    expect((await screen.findAllByText(/目前庫存地點/)).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('button', { name: '儲存對應' }).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: '使用者管理' })).toBeInTheDocument();

    useSessionStore.setState({ userRole: 'staff', oauthUser: staff });
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: '門市清單管理' })).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: '新增門市' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '儲存對應' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '庫存據點管理' })).toBeInTheDocument();
  });

  it('blocks staff store create and delete while still allowing a store switch', async () => {
    expect(await useSessionStore.getState().addStore('新門市')).toBe(false);
    expect(await useSessionStore.getState().removeStore('官網')).toBe(false);
    expect(await useSessionStore.getState().updateStoreStockLocation('官網', 'e1a10002-0000-4000-8000-000000000002')).toBe(false);
    expect(useSessionStore.getState().stores).toEqual(['奇可門市', '官網']);

    const result = await switchLoginStore('官網');
    expect(result.ok).toBe(true);
    expect(useSessionStore.getState().storeName).toBe('官網');
  });

  it('shows the in-use location error instead of a generic delete failure', async () => {
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    setStoredStores([{ name: '奇可門市', isDefault: true }]);
    useToastStore.setState({ toasts: [] });
    const user = userEvent.setup();
    render(
      <DeleteLocationModal
        location={{ id: LEGACY_SHARED_STOCK_LOCATION_ID, name: '門市現貨', isActive: true }}
        availableTargets={[{ id: 'e1a10002-0000-4000-8000-000000000002', name: '後方倉庫', isActive: true }]}
        onClose={() => undefined}
        onSuccess={() => undefined}
      />
    );
    await user.click(screen.getByRole('button', { name: '確認移轉庫存並刪除地點' }));
    await waitFor(() => {
      expect(useToastStore.getState().toasts.some((toast) => toast.message.includes('仍被門市'))).toBe(true);
    });
  });
});
