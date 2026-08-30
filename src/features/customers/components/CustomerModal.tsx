import { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { customerService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import type { Customer, VipTier } from '@/types/customer';
import { getVipTierName } from '@/types/customer';

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSaved: (customer: Customer) => void;
}

export function CustomerModal({ open, onClose, customer, onSaved }: CustomerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vipTier, setVipTier] = useState<VipTier>('regular');
  const [note, setNote] = useState('');
  const [rewardPoints, setRewardPoints] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const isEdit = !!customer;

  useEffect(() => {
    if (open) {
      if (customer) {
        setName(customer.name);
        setPhone(customer.phone);
        setEmail(customer.email ?? '');
        setVipTier(customer.vipTier);
        setNote(customer.note ?? '');
        setRewardPoints(customer.rewardPoints ?? 0);
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setVipTier('regular');
        setNote('');
        setRewardPoints(0);
      }
    }
  }, [open, customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('請輸入客戶姓名', 'warning');
      return;
    }
    if (!phone.trim()) {
      showToast('請輸入手機號碼', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const vipTierName = getVipTierName(vipTier);

      if (isEdit && customer) {
        const updated = await customerService.updateCustomer(customer.id, {
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          vipTier,
          vipTierName,
          note: note.trim() || undefined,
          rewardPoints: Number(rewardPoints) || 0,
        });
        if (updated) {
          showToast(`已成功更新會員「${updated.name}」資料`, 'success');
          onSaved(updated);
          onClose();
        }
      } else {
        const created = await customerService.createCustomer({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          vipTier,
          vipTierName,
          note: note.trim() || undefined,
          rewardPoints: Number(rewardPoints) || 0,
          totalSpent: 0,
        });
        showToast(`已成功建立新會員「${created.name}」`, 'success');
        onSaved(created);
        onClose();
      }
    } catch (err) {
      console.error(err);
      showToast('儲存會員資料時發生錯誤', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? '✏️ 編輯會員資料' : '➕ 新增客戶會員'}>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-zinc-200">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">
            客戶姓名 <span className="text-rose-400">*</span>
          </label>
          <Input
            placeholder="例如：陳冠宇 或 極速模型工作室"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">
              手機號碼 <span className="text-rose-400">*</span>
            </label>
            <Input
              monospace
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">電子信箱</label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">VIP 會員等級</label>
            <select
              value={vipTier}
              onChange={(e) => setVipTier(e.target.value as VipTier)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-400 focus:outline-none"
            >
              <option value="regular">一般會員 (無折扣)</option>
              <option value="silver">銀卡會員 (98折)</option>
              <option value="gold">金卡會員 (95折)</option>
              <option value="platinum">白金黑卡 (9折)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-400">累積點數</label>
            <Input
              type="number"
              monospace
              min={0}
              value={rewardPoints}
              onChange={(e) => setRewardPoints(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-400">偏好與備註事項</label>
          <textarea
            rows={3}
            placeholder="例如：主力收藏 1:18 日系 JDM、開統編 83521409..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? '儲存中...' : isEdit ? '更新資料' : '建立會員'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
