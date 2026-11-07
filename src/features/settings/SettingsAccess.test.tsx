import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useSessionStore } from '@/store/sessionStore';
import { SettingsPage } from './SettingsPage';

describe('settings access', () => {
  beforeEach(() => {
    useSessionStore.setState({
      userRole: 'staff',
      oauthUser: { id: 'acct-staff', name: '店員', email: 'clerk@example.com', role: 'staff' },
    });
  });

  it('lets staff open store and location settings without the whitelist', async () => {
    render(<SettingsPage />);
    expect(await screen.findByRole('button', { name: '庫存據點管理' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '門市清單管理' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '帳號白名單' })).not.toBeInTheDocument();
    expect(screen.queryByText('只有管理員可以管理白名單。')).not.toBeInTheDocument();
  });
});
