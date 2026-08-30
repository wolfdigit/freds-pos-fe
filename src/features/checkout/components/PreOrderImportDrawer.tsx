import { useState } from 'react';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { usePreOrderLookup } from '../hooks/usePreOrderLookup';
import { useCartStore } from '@/store/cartStore';
import { customerService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import { cn } from '@/utils/cn';

interface PreOrderImportDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function PreOrderImportDrawer({ open, onClose }: PreOrderImportDrawerProps) {
  const { phone, preOrders, isLoading, search } = usePreOrderLookup();
  const { importPreOrderItem, attachCustomer } = useCartStore();
  const [qtyByItem, setQtyByItem] = useState<Record<string, number>>({});
  const showToast = useToastStore((s) => s.showToast);

  if (!open) return null;

  const handleImport = async (preOrder: (typeof preOrders)[number], itemId: string) => {
    const item = preOrder.items.find((i) => i.id === itemId);
    if (!item) return;
    const available = item.qtyArrived - item.qtyDelivered;
    const qty = qtyByItem[itemId] ?? Math.min(1, available);
    if (qty < 1 || qty > available) {
      showToast('超過可取數量上限', 'error');
      return;
    }
    importPreOrderItem(preOrder, item, qty);
    const customer = await customerService.getCustomerById(preOrder.customerId);
    if (customer) attachCustomer(customer);
    showToast(`已帶入 ${item.productName} x${qty}`, 'success');
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex h-full w-96 flex-col border-l border-zinc-800 bg-zinc-950 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-zinc-100">快速帶入未結預訂單</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200">
            ✕
          </button>
        </div>
        <Input
          monospace
          autoFocus
          placeholder="輸入客戶電話 (例: 0912)"
          value={phone}
          onChange={(e) => search(e.target.value)}
        />
        <div className="mt-3 flex-1 space-y-3 overflow-y-auto">
          {isLoading && <p className="text-sm text-zinc-500">搜尋中…</p>}
          {!isLoading && phone && preOrders.length === 0 && (
            <p className="text-sm text-zinc-500">找不到此電話的未結預購單</p>
          )}
          {preOrders.map((po) => (
            <div key={po.id} className="rounded-lg border border-zinc-800 bg-zinc-900 p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-zinc-100">
                  {po.customerName} · {po.orderNumber}
                </p>
                <Badge color="amber">{po.status}</Badge>
              </div>
              {po.items.map((item) => {
                const available = item.qtyArrived - item.qtyDelivered;
                return (
                  <div key={item.id} className="mb-2 rounded-md bg-zinc-950 p-2">
                    <p className="text-xs text-zinc-300">{item.productName}</p>
                    <p className="font-mono text-xs text-zinc-500">
                      預訂: {item.qtyOrdered} 台　到貨: {item.qtyArrived} 台　已取: {item.qtyDelivered} 台
                    </p>
                    <p
                      className={cn(
                        'font-mono text-xs font-semibold',
                        available > 0 ? 'text-emerald-400' : 'text-zinc-600'
                      )}
                    >
                      本次可取貨: {available} 台
                    </p>
                    {available > 0 && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={available}
                          defaultValue={Math.min(1, available)}
                          onChange={(e) =>
                            setQtyByItem((prev) => ({ ...prev, [item.id]: Number(e.target.value) }))
                          }
                          className="w-16 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs font-mono"
                        />
                        <Button size="sm" variant="primary" onClick={() => handleImport(po, item.id)}>
                          帶入結帳清單
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
