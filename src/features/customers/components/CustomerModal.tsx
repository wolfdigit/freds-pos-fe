import { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { customerService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import type { Customer, VipTier } from '@/types/customer';

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
  const [vipTier, setVipTier] = useState<VipTier>('Retail');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
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
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setVipTier('Retail');
        setNote('');
      }
      setErrors({});
    }
  }, [open, customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: { name?: string; phone?: string } = {};
    if (!name.trim()) next.name = '請填寫客戶姓名';
    if (!phone.trim()) next.phone = '請填寫手機號碼';
    setErrors(next);
    if (next.name || next.phone) return;

    setSubmitting(true);
    try {
      const emailValue = email.trim() ? email.trim() : isEdit ? null : undefined;

      if (isEdit && customer) {
        const updated = await customerService.updateCustomer(customer.id, {
          name: name.trim(),
          phone: phone.trim(),
          email: emailValue,
          vipTier,
          note: note.trim() || undefined,
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
          email: emailValue,
          vipTier,
          note: note.trim() || undefined,
        });
        showToast(`已成功建立新會員「${created.name}」`, 'success');
        onSaved(created);
        onClose();
      }
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'CUSTOMER_PHONE_DUPLICATE' || err?.message?.includes('CUSTOMER_PHONE_DUPLICATE') || err?.message?.includes('手機號碼已存在')) {
        showToast('手機號碼已存在', 'error');
      } else if (err?.code === 'CUSTOMER_EMAIL_DUPLICATE' || err?.message?.includes('CUSTOMER_EMAIL_DUPLICATE') || err?.message?.includes('電子信箱已存在')) {
        showToast('電子信箱已存在', 'error');
      } else if (err?.code === 'CUSTOMER_NOT_FOUND' || err?.message?.includes('CUSTOMER_NOT_FOUND')) {
        showToast('找不到該會員資料', 'error');
      } else {
        showToast('儲存會員資料時發生錯誤', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? '✏️ 編輯客戶會員資料' : '➕ 新增客戶會員'}>
      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-zinc-200">
        <div>
          <label htmlFor="customer-name" className="mb-1 block text-xs font-medium text-zinc-400">
            客戶姓名 / 店家名稱 <span className="text-rose-400">*</span>
          </label>
          <Input
            id="customer-name"
            placeholder="例如：陳冠宇 或 Max Gear 或 創Q本館"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && <p className="mt-1 text-xs font-medium text-rose-300">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="customer-phone" className="mb-1 block text-xs font-medium text-zinc-400">
              手機號碼 / 聯絡電話 <span className="text-rose-400">*</span>
            </label>
            <Input
              id="customer-phone"
              monospace
              placeholder="0912345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {errors.phone && <p className="mt-1 text-xs font-medium text-rose-300">{errors.phone}</p>}
          </div>
          <div>
            <label htmlFor="customer-email" className="mb-1 block text-xs font-medium text-zinc-400">電子信箱 (選填)</label>
            <Input
              id="customer-email"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label htmlFor="customer-tier" className="mb-1 block text-xs font-medium text-zinc-400">客戶等級 / 經銷分類</label>
          <select
            id="customer-tier"
            value={vipTier}
            onChange={(e) => setVipTier(e.target.value as VipTier)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-400 focus:outline-none"
          >
            <option value="Retail">Retail (一般零售)</option>
            <option value="B">B 級批發經銷</option>
            <option value="A">A 級批發經銷</option>
            <option value="S">S 級特約經銷</option>
          </select>
        </div>

        <div>
          <label htmlFor="customer-note" className="mb-1 block text-xs font-medium text-zinc-400">偏好與備註事項</label>
          <textarea
            id="customer-note"
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
