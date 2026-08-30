import { useEffect, useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { preOrderService, productService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import type { PreOrder, PreOrderItem } from '@/types/preorder';
import type { Customer } from '@/types/customer';
import type { Product } from '@/types/product';
import { formatDateTime, nowIso } from '@/utils/date';

interface PreOrderModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer;
  preOrder?: PreOrder | null;
  onSaved: (saved: PreOrder) => void;
}

export function PreOrderModal({ open, onClose, customer, preOrder, onSaved }: PreOrderModalProps) {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [expectedArrivalDate, setExpectedArrivalDate] = useState('');
  const [source, setSource] = useState<'in_store' | 'website'>('in_store');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<PreOrderItem[]>([]);
  const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const isEdit = !!preOrder;
  const operatorName = preOrder?.operatorName || '店長 Fred';
  const displayTime = preOrder ? formatDateTime(preOrder.updatedAt) : formatDateTime(nowIso());

  useEffect(() => {
    if (open) {
      // 載入商品庫存選單
      productService.searchProducts({ keyword: '' }).then(setAvailableProducts);

      if (preOrder) {
        setOrderNumber(preOrder.orderNumber);
        setOrderDate(preOrder.orderDate);
        setExpectedArrivalDate(preOrder.expectedArrivalDate ?? '');
        setSource(preOrder.source ?? 'in_store');
        setNote(preOrder.note ?? '');
        setItems(preOrder.items.map((i) => ({ ...i })));
      } else {
        const today = new Date().toISOString().split('T')[0];
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setOrderNumber(`PO-${today.replace(/-/g, '').slice(0, 6)}-${randomNum}`);
        setOrderDate(today);
        setExpectedArrivalDate('');
        setSource('in_store');
        setNote('');
        setItems([]);
      }
    }
  }, [open, preOrder]);

  const handleAddProduct = () => {
    if (!selectedProductId) return;
    const prod = availableProducts.find((p) => p.id === selectedProductId);
    if (!prod) return;

    // 檢查是否已在列表中
    const existing = items.find((i) => i.productId === prod.id);
    if (existing) {
      setItems(items.map((i) => (i.productId === prod.id ? { ...i, qtyOrdered: i.qtyOrdered + 1 } : i)));
    } else {
      const newItem: PreOrderItem = {
        id: `poi-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: prod.id,
        sku: prod.sku,
        productName: prod.name,
        scale: prod.scale,
        brand: prod.brand,
        quotedPrice: prod.vipPrice || prod.listPrice,
        qtyOrdered: 1,
        qtyArrived: 0,
        qtyDelivered: 0,
      };
      setItems([...items, newItem]);
    }
    setSelectedProductId('');
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter((i) => i.id !== itemId));
  };

  const handleUpdateItem = (itemId: string, field: keyof PreOrderItem, value: number) => {
    setItems(
      items.map((i) => {
        if (i.id !== itemId) return i;
        const numVal = Math.max(0, value);
        return { ...i, [field]: numVal };
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      showToast('請至少新增一個預購商品品項', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit && preOrder) {
        const updated = await preOrderService.updatePreOrder(preOrder.id, {
          orderNumber,
          orderDate,
          expectedArrivalDate: expectedArrivalDate || undefined,
          source,
          items,
          note: note.trim() || undefined,
          operatorName,
        });
        if (updated) {
          showToast(`已更新預購單「${updated.orderNumber}」`, 'success');
          onSaved(updated);
          onClose();
        }
      } else {
        const created = await preOrderService.createPreOrder({
          orderNumber,
          customerId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          orderDate,
          expectedArrivalDate: expectedArrivalDate || undefined,
          source,
          items,
          note: note.trim() || undefined,
          operatorName,
        });
        showToast(`已成功新增預購單「${created.orderNumber}」`, 'success');
        onSaved(created);
        onClose();
      }
    } catch (err) {
      console.error(err);
      showToast('儲存預購單時發生錯誤', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `✏️ 編輯預購單 (${preOrder?.orderNumber})` : `➕ 新增預訂單 (會員：${customer.name})`}
      widthClassName="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm text-zinc-200 select-none">
        {/* 客戶與單號資訊列 */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
          <div>
            <span className="text-xs text-zinc-400">會員姓名與電話</span>
            <p className="font-semibold text-zinc-100 mt-0.5">
              {customer.name} <span className="font-mono text-zinc-400 text-xs">({customer.phone})</span>
            </p>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-0.5">預購單號</label>
            <Input
              monospace
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
          </div>
        </div>

        {/* 日期與來源 */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">訂單日期</label>
            <Input
              type="date"
              monospace
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">預計到貨日</label>
            <Input
              type="date"
              monospace
              value={expectedArrivalDate}
              onChange={(e) => setExpectedArrivalDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">訂單來源</label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as 'in_store' | 'website')}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-400 focus:outline-none"
            >
              <option value="in_store">門市現場訂購</option>
              <option value="website">官網匯入訂單</option>
            </select>
          </div>
        </div>

        {/* 唯讀稽核欄位：經手人與時間 */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-amber-900/40 bg-amber-950/20 p-3">
          <div>
            <label className="block text-xs font-medium text-amber-300/80 mb-0.5">👤 經手人員 / 操作員 (唯讀)</label>
            <input
              type="text"
              readOnly
              value={operatorName}
              className="w-full rounded-lg border border-amber-900/50 bg-zinc-950 px-3 py-1.5 font-mono text-xs font-semibold text-amber-200 cursor-not-allowed select-none focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-amber-300/80 mb-0.5">🕒 最後操作時間 (唯讀)</label>
            <input
              type="text"
              readOnly
              value={displayTime}
              className="w-full rounded-lg border border-amber-900/50 bg-zinc-950 px-3 py-1.5 font-mono text-xs text-zinc-400 cursor-not-allowed select-none focus:outline-none"
            />
          </div>
        </div>

        {/* 選擇加入商品 */}
        <div className="space-y-2 pt-2 border-t border-zinc-800">
          <label className="block text-xs font-bold text-zinc-300">加入預購商品品項</label>
          <div className="flex gap-2">
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 focus:border-cyan-400 focus:outline-none text-xs font-mono"
            >
              <option value="">-- 請選擇欲預訂之商品 --</option>
              {availableProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.brand} {p.name} (定價 ${p.listPrice} / VIP ${p.vipPrice || p.listPrice})
                </option>
              ))}
            </select>
            <Button type="button" size="sm" variant="secondary" onClick={handleAddProduct}>
              + 加入品項
            </Button>
          </div>
        </div>

        {/* 商品明細清單 */}
        <div className="space-y-2">
          {items.length === 0 ? (
            <p className="py-4 text-center text-xs text-zinc-500 bg-zinc-950/40 rounded-lg">
              尚未加入任何預購品項，請從上方選擇商品點選「+ 加入品項」
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400">{item.sku}</span>
                    <span className="text-xs text-zinc-300 font-semibold">{item.productName}</span>
                    <span className="text-xs text-zinc-500">({item.brand} {item.scale})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2 py-0.5 rounded hover:bg-zinc-800"
                  >
                    ✕ 移除
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-zinc-900 text-xs font-mono">
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-0.5">預購單價 / 報價</label>
                    <Input
                      type="number"
                      monospace
                      min={0}
                      value={item.quotedPrice}
                      onChange={(e) => handleUpdateItem(item.id, 'quotedPrice', parseInt(e.target.value) || 0)}
                      className="py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-0.5">預訂數量</label>
                    <Input
                      type="number"
                      monospace
                      min={1}
                      value={item.qtyOrdered}
                      onChange={(e) => handleUpdateItem(item.id, 'qtyOrdered', parseInt(e.target.value) || 1)}
                      className="py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-0.5">已到貨數 (qtyArrived)</label>
                    <Input
                      type="number"
                      monospace
                      min={0}
                      value={item.qtyArrived}
                      onChange={(e) => handleUpdateItem(item.id, 'qtyArrived', parseInt(e.target.value) || 0)}
                      className="py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-zinc-500 mb-0.5">已取貨數 (qtyDelivered)</label>
                    <Input
                      type="number"
                      monospace
                      min={0}
                      value={item.qtyDelivered}
                      onChange={(e) => handleUpdateItem(item.id, 'qtyDelivered', parseInt(e.target.value) || 0)}
                      className="py-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 備註 */}
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-1">訂單備註</label>
          <textarea
            rows={2}
            placeholder="例如：常客，交代到貨電話通知..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-100 placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none text-xs"
          />
        </div>

        <div className="mt-6 flex justify-end gap-3 pt-3 border-t border-zinc-800">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            取消
          </Button>
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? '儲存中...' : isEdit ? '更新預購單' : '建立預購單'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
