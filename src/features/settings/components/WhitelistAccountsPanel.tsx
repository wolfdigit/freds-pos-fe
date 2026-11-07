import { useCallback, useEffect, useState } from 'react';
import { displayAccountName } from '@/auth/displayName';
import {
  accountGuardMessage,
  deletionBlock,
  demotionBlock,
  hasPermission,
  normalizeRole,
} from '@/auth/permissions';
import { errorMessage } from '@/auth/businessError';
import { systemService } from '@/services';
import type { ISystemService } from '@/services/interfaces/ISystemService';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Spinner } from '@/components/feedback/Spinner';
import type { OAuthAccountDto } from '@/types/system';

interface WhitelistAccountsPanelProps {
  actorEmail: string;
  actorRole: string;
  service?: ISystemService;
}

export function WhitelistAccountsPanel({
  actorEmail,
  actorRole,
  service = systemService,
}: WhitelistAccountsPanelProps) {
  const [accounts, setAccounts] = useState<OAuthAccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'staff'>('staff');
  const [note, setNote] = useState('');
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editRole, setEditRole] = useState<'admin' | 'staff'>('staff');

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setAccounts(await service.listAccounts());
    } catch (err) {
      setError(errorMessage(err, '無法讀取使用者管理'));
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    service
      .listAccounts()
      .then((rows) => {
        if (!cancelled) setAccounts(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(errorMessage(err, '無法讀取使用者管理'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [service]);

  const adminCount = accounts.filter((account) => normalizeRole(account.role) === 'admin').length;

  const createAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await service.createAccount({
        email: email.trim(),
        role,
        name: name.trim(),
        note: note.trim() || null,
      });
      setName('');
      setEmail('');
      setNote('');
      setRole('staff');
      await reload();
    } catch (err) {
      setError(errorMessage(err, '無法新增帳號'));
    }
  };

  const saveAccount = async (account: OAuthAccountDto) => {
    const blocked = demotionBlock({
      actorEmail,
      targetEmail: account.email,
      targetRole: account.role,
      nextRole: editRole,
      adminCount,
    });
    if (blocked) {
      setError(accountGuardMessage(blocked, 'demote'));
      return;
    }
    setError(null);
    try {
      await service.updateAccount(account.email, {
        name: editName.trim(),
        note: editNote.trim(),
        role: editRole,
      });
      setEditingEmail(null);
      await reload();
    } catch (err) {
      setError(errorMessage(err, '無法更新帳號'));
      await reload();
    }
  };

  const removeAccount = async (account: OAuthAccountDto) => {
    const blocked = deletionBlock({
      actorEmail,
      targetEmail: account.email,
      targetRole: account.role,
      adminCount,
    });
    if (blocked) {
      setError(accountGuardMessage(blocked, 'delete'));
      return;
    }
    setError(null);
    try {
      await service.deleteAccount(account.email);
      await reload();
    } catch (err) {
      setError(errorMessage(err, '無法刪除帳號'));
      await reload();
    }
  };

  if (!hasPermission(actorRole, 'whitelist.manage')) {
    return <p className="text-sm text-zinc-300">只有管理員可以使用使用者管理。</p>;
  }

  if (loading && accounts.length === 0) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-4">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h3 className="text-lg font-bold text-zinc-100">使用者管理</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-400">僅限已加入的 Google 帳號登入。</p>
      </div>
      <form onSubmit={createAccount} className="grid gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 md:grid-cols-5">
        <Input aria-label="顯示名稱" value={name} onChange={(event) => setName(event.target.value)} placeholder="顯示名稱（可留白）" />
        <Input aria-label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="email" required />
        <select
          aria-label="角色"
          value={role}
          onChange={(event) => setRole(event.target.value === 'admin' ? 'admin' : 'staff')}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
        >
          <option value="staff">staff</option>
          <option value="admin">admin</option>
        </select>
        <Input aria-label="附註" value={note} onChange={(event) => setNote(event.target.value)} placeholder="附註" />
        <Button type="submit" variant="primary">
          新增帳號
        </Button>
      </form>
      {error && (
        <p className="text-sm text-rose-300" role="alert">
          {error}
        </p>
      )}
      <ul className="divide-y divide-zinc-800 rounded-2xl border border-zinc-800">
        {accounts.map((account) => {
          const isSelf = account.email.toLowerCase() === actorEmail.trim().toLowerCase();
          const deleteBlocked = deletionBlock({
            actorEmail,
            targetEmail: account.email,
            targetRole: account.role,
            adminCount,
          });
          const editing = editingEmail === account.email;
          return (
            <li key={account.id || account.email} className="space-y-2 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-zinc-100">
                    {displayAccountName(account.name, account.email)}
                    {isSelf && <span className="ml-2 text-xs text-cyan-300">目前登入</span>}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {account.email} · {account.role}
                    {account.note ? ` · ${account.note}` : ''}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingEmail(account.email);
                      setEditName(account.name ?? '');
                      setEditNote(account.note || '');
                      setEditRole(normalizeRole(account.role) === 'admin' ? 'admin' : 'staff');
                    }}
                  >
                    編輯
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={Boolean(deleteBlocked)}
                    title={deleteBlocked ? accountGuardMessage(deleteBlocked, 'delete') : '刪除帳號'}
                    onClick={() => void removeAccount(account)}
                  >
                    刪除
                  </Button>
                </div>
              </div>
              {editing && (
                <div className="grid gap-2 md:grid-cols-4">
                  <Input
                    aria-label={`${account.email} 顯示名稱`}
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    placeholder="顯示名稱（可留白）"
                  />
                  <Input aria-label={`${account.email} 附註`} value={editNote} onChange={(event) => setEditNote(event.target.value)} />
                  <select
                    aria-label={`${account.email} 角色`}
                    value={editRole}
                    disabled={isSelf}
                    onChange={(event) => setEditRole(event.target.value === 'admin' ? 'admin' : 'staff')}
                    className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 text-sm disabled:opacity-50"
                  >
                    <option value="staff">staff</option>
                    <option value="admin">admin</option>
                  </select>
                  <Button type="button" variant="primary" onClick={() => void saveAccount(account)}>
                    儲存
                  </Button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
