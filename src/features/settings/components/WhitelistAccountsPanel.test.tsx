import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ISystemService } from '@/services/interfaces/ISystemService';
import type { OAuthAccountDto } from '@/types/system';
import { WhitelistAccountsPanel } from './WhitelistAccountsPanel';

const adminAccount: OAuthAccountDto = {
  id: 'acct-admin',
  email: 'owner@example.com',
  role: 'admin',
  name: '主管理員',
  note: '',
};
const staffAccount: OAuthAccountDto = {
  id: 'acct-staff',
  email: 'clerk@example.com',
  role: 'staff',
  name: '店員',
  note: '早班',
};

function serviceWith(accounts: OAuthAccountDto[]): ISystemService {
  return {
    getStores: vi.fn(async () => []),
    createStore: vi.fn(),
    deleteStore: vi.fn(),
    listAccounts: vi.fn(async () => accounts),
    createAccount: vi.fn(async (request) => ({ id: 'acct-new', ...request })),
    updateAccount: vi.fn(async (email, request) => ({ ...adminAccount, email, ...request })),
    deleteAccount: vi.fn(async () => undefined),
  };
}

describe('whitelist panel', () => {
  it('hides management from staff and talks to the injected backend service for admins', async () => {
    const user = userEvent.setup();
    const denied = serviceWith([]);
    const { rerender } = render(
      <WhitelistAccountsPanel actorEmail="clerk@example.com" actorRole="staff" service={denied} />
    );
    expect(screen.getByText('只有管理員可以使用使用者管理。')).toBeInTheDocument();

    const service = serviceWith([adminAccount, staffAccount]);
    rerender(<WhitelistAccountsPanel actorEmail="owner@example.com" actorRole="admin" service={service} />);
    expect(await screen.findByText(/clerk@example.com/)).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: '刪除' });
    expect(deleteButtons[0]).toBeDisabled();
    expect(deleteButtons[1]).toBeEnabled();
    await user.click(deleteButtons[1]!);
    expect(service.deleteAccount).toHaveBeenCalledWith('clerk@example.com');

    await user.type(screen.getByLabelText('顯示名稱'), '新同事');
    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.click(screen.getByRole('button', { name: '新增帳號' }));
    expect(service.createAccount).toHaveBeenCalledWith({
      email: 'new@example.com',
      role: 'staff',
      name: '新同事',
      note: null,
    });
  });

  it('does not send a self demotion', async () => {
    const user = userEvent.setup();
    const service = serviceWith([adminAccount, { ...staffAccount, role: 'admin', id: 'acct-admin-2', email: 'other@example.com' }]);
    render(<WhitelistAccountsPanel actorEmail="owner@example.com" actorRole="admin" service={service} />);
    expect(await screen.findByText(/owner@example.com/)).toBeInTheDocument();
    const editButtons = screen.getAllByRole('button', { name: '編輯' });
    await user.click(editButtons[0]!);
    expect(screen.getByLabelText('owner@example.com 角色')).toBeDisabled();
  });
});
