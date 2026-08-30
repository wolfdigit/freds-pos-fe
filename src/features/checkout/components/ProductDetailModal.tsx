import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/utils/currency';
import type { Product } from '@/types/product';

interface ProductDetailModalProps {
  open: boolean;
  product: Product | null;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  showAddToCart?: boolean;
  zIndexClassName?: string;
}

export function ProductDetailModal({
  open,
  product,
  onClose,
  onAddToCart,
  onEdit,
  showAddToCart = true,
  zIndexClassName,
}: ProductDetailModalProps) {
  if (!product) return null;

  const storeStock = product.stocks.find((s) => s.location === 'store')?.quantity ?? 0;
  const warehouseStock = product.stocks.find((s) => s.location === 'warehouse')?.quantity ?? 0;
  const companyStock = product.stocks.find((s) => s.location === 'company')?.quantity ?? 0;

  return (
    <Modal open={open} onClose={onClose} title="商品詳細資訊" widthClassName="max-w-2xl" zIndexClassName={zIndexClassName}>
      <div className="space-y-5 text-base text-zinc-200">
        {/* 頂部廠牌與名稱 */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="rounded bg-zinc-800 px-2 py-0.5 text-sm font-semibold text-zinc-300">
              {product.brand}
            </span>
            <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-sm text-zinc-400">
              {product.scale}
            </span>
            {product.status === 'discontinued' ? (
              <Badge color="rose">已停產</Badge>
            ) : (
              <Badge color="emerald">在庫販售</Badge>
            )}
          </div>
          <h3 className="text-xl font-bold text-zinc-100">{product.name}</h3>
        </div>

        {/* 貨號、條碼與顏色材質 */}
        <div className="grid grid-cols-2 gap-3 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5 font-mono text-base">
          <div>
            <span className="text-zinc-500 text-sm block">貨號 (SKU)</span>
            <span className="font-bold text-zinc-200">{product.sku}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-sm block">國際條碼 (Barcode)</span>
            <span className="font-bold text-zinc-200">{product.barcode || '無'}</span>
          </div>
          {product.color && (
            <div>
              <span className="text-zinc-500 text-sm block">原廠車色</span>
              <span className="text-zinc-200 font-sans">{product.color}</span>
            </div>
          )}
          {product.material && (
            <div>
              <span className="text-zinc-500 text-sm block">車身材質</span>
              <span className="text-zinc-200 font-sans">{product.material}</span>
            </div>
          )}
        </div>

        {/* 價格設定 */}
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-cyan-900/40 bg-cyan-950/20 p-3.5">
          <div>
            <span className="text-zinc-400 text-sm block">門市牌價 (定價)</span>
            <span className="font-mono text-2xl font-bold text-cyan-300">
              {formatCurrency(product.listPrice)}
            </span>
          </div>
          {product.vipPrice ? (
            <div>
              <span className="text-zinc-400 text-sm block">會員 VIP 特價</span>
              <span className="font-mono text-2xl font-bold text-emerald-400">
                {formatCurrency(product.vipPrice)}
              </span>
            </div>
          ) : (
            <div>
              <span className="text-zinc-400 text-sm block">會員 VIP 特價</span>
              <span className="text-zinc-500 text-base">無特殊 VIP 價 (依等級常規折扣)</span>
            </div>
          )}
        </div>

        {/* 庫存分佈情況與預購保留數量 */}
        <div>
          <h4 className="text-base font-semibold text-zinc-300 mb-2.5">庫存分佈情況</h4>
          <div className="grid grid-cols-5 gap-2.5 text-center font-mono">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <span className="text-sm text-zinc-400 block mb-1">門市現貨</span>
              <span
                className={`text-2xl font-bold ${
                  storeStock > 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {storeStock} 台
              </span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <span className="text-sm text-zinc-400 block mb-1">後方倉庫</span>
              <span className="text-2xl font-bold text-zinc-200">{warehouseStock} 台</span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <span className="text-sm text-zinc-400 block mb-1">公司總倉</span>
              <span className="text-2xl font-bold text-zinc-200">{companyStock} 台</span>
            </div>
            <div className="rounded-xl border border-cyan-800/60 bg-cyan-950/30 p-3">
              <span className="text-sm text-cyan-300 block mb-1">全域總庫存</span>
              <span className="text-2xl font-bold text-cyan-300">{product.totalStock} 台</span>
            </div>
            <div className="rounded-xl border border-amber-800/70 bg-amber-950/30 p-3">
              <span className="text-sm text-amber-300 font-semibold block mb-1">★ 預購未取</span>
              <span className="text-2xl font-extrabold text-amber-400">
                {product.preOrderPendingCount} 台
              </span>
            </div>
          </div>
        </div>

        {/* 預購保留簡要提示 */}
        {product.preOrderPendingCount > 0 && (() => {
          const sellableTotal = product.totalStock - product.preOrderPendingCount;
          const isShortage = sellableTotal <= 0;

          return (
            <div
              className={`rounded-xl border px-4 py-2.5 text-base flex items-center justify-between transition-colors ${
                isShortage
                  ? 'border-amber-800/80 bg-amber-950/40 text-amber-300'
                  : 'border-zinc-800 bg-zinc-950/50 text-zinc-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {isShortage && <span>⚠️</span>}
                <span>
                  預購保留 {product.preOrderPendingCount} 台
                  {isShortage ? (
                    <strong className="text-amber-400 ml-1.5">（現貨不足以完全保留，尚缺 {Math.abs(sellableTotal)} 台）</strong>
                  ) : (
                    <span className="text-zinc-400 ml-1.5">（可直接現售：<strong className="text-cyan-300">{sellableTotal}</strong> 台）</span>
                  )}
                </span>
              </div>
              {isShortage && (
                <span className="text-xs text-amber-300 font-bold border border-amber-700/60 bg-amber-950/60 px-2 py-0.5 rounded">
                  需進貨補足
                </span>
              )}
            </div>
          );
        })()}
        {product.note && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-950/40 px-4 py-2 text-sm text-zinc-400">
            備註：{product.note}
          </div>
        )}

        {/* 彈窗按鈕 */}
        <div className="flex justify-end gap-3 pt-2">
          {onEdit && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                onEdit(product);
                onClose();
              }}
              className="text-base font-semibold text-cyan-300 border-cyan-700/60 hover:bg-cyan-950/40"
            >
              ✏️ 編輯商品資訊
            </Button>
          )}
          <Button variant="ghost" size="lg" onClick={onClose} className="text-base">
            關閉
          </Button>
          {showAddToCart && onAddToCart && (
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                onAddToCart(product);
                onClose();
              }}
              className="text-base font-bold"
            >
              + 加入此商品至結帳單
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
