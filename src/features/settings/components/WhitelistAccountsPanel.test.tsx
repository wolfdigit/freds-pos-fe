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
    rebindStore: vi.fn(),
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

  it('uses the exact subtitle and keeps a blank display name', async () => {
    const user = userEvent.setup();
    const unnamed: OAuthAccountDto = {
      id: 'acct-blank',
      email: 'blank@example.com',
      role: 'staff',
      name: '   ',
      note: null,
    };
    const named: OAuthAccountDto = {
      id: 'acct-named',
      email: 'named@example.com',
      role: 'staff',
      name: '早班',
      note: null,
    };
    const service = serviceWith([unnamed, named]);
    render(<WhitelistAccountsPanel actorEmail="owner@example.com" actorRole="admin" service={service} />);

    expect(await screen.findByText('僅限已加入的 Google 帳號登入。')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('顯示名稱').length).toBeGreaterThan(0);
    expect(screen.queryByPlaceholderText(/可留白/)).not.toBeInTheDocument();
    expect(screen.getAllByText('blank@example.com').length).toBeGreaterThan(0);

    await user.type(screen.getByLabelText('Email'), 'new@example.com');
    await user.type(screen.getByLabelText('顯示名稱'), '   ');
    await user.click(screen.getByRole('button', { name: '新增帳號' }));
    expect(service.createAccount).toHaveBeenCalledWith({
      email: 'new@example.com',
      role: 'staff',
      name: '',
      note: null,
    });

    const editButtons = screen.getAllByRole('button', { name: '編輯' });
    await user.click(editButtons[1]!);
    expect(screen.getByLabelText('named@example.com 顯示名稱')).toHaveAttribute('placeholder', '顯示名稱');
    expect(screen.queryByPlaceholderText(/可留白/)).not.toBeInTheDocument();
    await user.clear(screen.getByLabelText('named@example.com 顯示名稱'));
    await user.click(screen.getByRole('button', { name: '儲存' }));
    expect(service.updateAccount).toHaveBeenCalledWith('named@example.com', {
      name: '',
      note: '',
      role: 'staff',
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
