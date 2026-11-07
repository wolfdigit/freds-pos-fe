import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSessionStore } from '@/store/sessionStore';
import { switchLoginStore } from '@/store/authStore';
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
    expect(screen.queryByRole('button', { name: '使用者管理' })).not.toBeInTheDocument();
  });

  it('shows store management to an admin and hides it after a downgrade', async () => {
    const user = userEvent.setup();
    useSessionStore.setState({ userRole: 'admin', oauthUser: admin });
    render(<SettingsPage />);
    await user.click(await screen.findByRole('button', { name: '門市清單管理' }));
    expect(screen.getByRole('button', { name: '新增門市' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '使用者管理' })).toBeInTheDocument();

    useSessionStore.setState({ userRole: 'staff', oauthUser: staff });
    await waitFor(() => {
      expect(screen.queryByRole('button', { name: '門市清單管理' })).not.toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: '新增門市' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '庫存據點管理' })).toBeInTheDocument();
  });

  it('blocks staff store create and delete while still allowing a store switch', async () => {
    expect(await useSessionStore.getState().addStore('新門市')).toBe(false);
    expect(await useSessionStore.getState().removeStore('官網')).toBe(false);
    expect(useSessionStore.getState().stores).toEqual(['奇可門市', '官網']);

    const result = await switchLoginStore('官網');
    expect(result.ok).toBe(true);
    expect(useSessionStore.getState().storeName).toBe('官網');
  });
});
