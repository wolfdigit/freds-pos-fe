import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { formatCurrency } from '@/utils/currency';
import type { Product } from '@/types/product';
import { productService } from '@/services';

interface ProductDetailModalProps {
  open: boolean;
  product: Product | null;
  allProducts?: Product[];
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
  onEdit?: (product: Product) => void;
  showAddToCart?: boolean;
  zIndexClassName?: string;
}

export function ProductDetailModal({
  open,
  product,
  allProducts,
  onClose,
  onAddToCart,
  onEdit,
  showAddToCart = true,
  zIndexClassName,
}: ProductDetailModalProps) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(product);
  const [siblingProducts, setSiblingProducts] = useState<Product[]>([]);

  useEffect(() => {
    setActiveProduct(product);
  }, [product]);

  useEffect(() => {
    if (!open || !activeProduct) {
      setSiblingProducts([]);
      return;
    }

    if (activeProduct.barcode) {
      if (allProducts && allProducts.length > 0) {
        const siblings = allProducts.filter(
          (p) => p.barcode === activeProduct.barcode && p.barcode !== ''
        );
        setSiblingProducts(siblings);
      } else {
        // 若未傳入 allProducts，自 productService 查詢同條碼商品
        productService.searchProducts({ keyword: activeProduct.barcode }).then((res) => {
          const siblings = res.filter((p) => p.barcode === activeProduct.barcode);
          if (siblings.length > 1) {
            setSiblingProducts(siblings);
          } else {
            setSiblingProducts([activeProduct]);
          }
        });
      }
    } else {
      setSiblingProducts([activeProduct]);
    }
  }, [open, activeProduct?.barcode, allProducts]);

  if (!activeProduct) return null;

  const currentProduct = activeProduct;
  const storeStock = currentProduct.stocks.find((s) => s.location === 'store')?.quantity ?? 0;
  const warehouseStock = currentProduct.stocks.find((s) => s.location === 'warehouse')?.quantity ?? 0;
  const companyStock = currentProduct.stocks.find((s) => s.location === 'company')?.quantity ?? 0;

  const preOrderPending = currentProduct.preOrderPendingCount ?? 0;
  const sellableTotal = Math.max(0, currentProduct.totalStock - preOrderPending);
  const isShortage = sellableTotal <= 0 && currentProduct.totalStock > 0;
  const hasMultipleSkus = siblingProducts.length > 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="商品詳細資訊"
      widthClassName="max-w-2xl"
      zIndexClassName={zIndexClassName}
    >
      <div className="space-y-4 text-base text-zinc-200">
        {/* 頂部廠牌與名稱 */}
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="rounded bg-zinc-800 px-2.5 py-0.5 text-sm font-bold text-zinc-200">
              {currentProduct.brand}
            </span>
            <span className="rounded bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-400 font-mono">
              {currentProduct.scale}
            </span>
          </div>
          <h3 className="text-xl font-bold text-zinc-100">{currentProduct.name}</h3>
        </div>

        {/* 同條碼多貨號切換下拉選單 (依需求 6) */}
        {hasMultipleSkus && (
          <div className="rounded-xl border border-cyan-800/60 bg-cyan-950/30 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-cyan-300 font-bold text-sm">🏷️ 同條碼其他貨號：</span>
              <span className="text-xs text-zinc-400 font-mono">
                (條碼: {currentProduct.barcode})
              </span>
            </div>
            <select
              value={currentProduct.id}
              onChange={(e) => {
                const target = siblingProducts.find((p) => p.id === e.target.value);
                if (target) setActiveProduct(target);
              }}
              className="rounded-lg border border-cyan-600/80 bg-zinc-900 px-3 py-1.5 text-sm font-mono font-bold text-cyan-200 focus:border-cyan-400 focus:outline-none"
            >
              {siblingProducts.map((p) => (
                <option key={p.id} value={p.id}>
                  [{p.sku}] {p.spec ? `${p.spec} - ` : ''}
                  {formatCurrency(p.listPrice)}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 貨號、條碼、規格與備註 (左右兩欄對齊) */}
        <div className="grid grid-cols-2 gap-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3.5 font-mono text-base">
          <div>
            <span className="text-zinc-500 text-xs block">貨號 (SKU)</span>
            <span className="font-bold text-zinc-200 text-base">{currentProduct.sku}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-xs block">國際條碼 (Barcode)</span>
            <span className="font-bold text-zinc-200 text-base">{currentProduct.barcode || '無'}</span>
          </div>
          <div>
            <span className="text-zinc-500 text-xs block">規格</span>
            <span className="text-zinc-200 font-sans text-sm block truncate" title={currentProduct.spec}>
              {currentProduct.spec || '未填寫特定規格'}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 text-xs block">備註</span>
            <span className="text-zinc-300 font-sans text-sm block truncate" title={currentProduct.note}>
              {currentProduct.note || '-'}
            </span>
          </div>
        </div>

        {/* 價格設定 */}
        <div className="rounded-lg border border-cyan-900/40 bg-cyan-950/20 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-zinc-400 text-xs block font-mono">門市定價</span>
            <span className="font-mono text-3xl font-extrabold text-cyan-300">
              {formatCurrency(currentProduct.listPrice)}
            </span>
          </div>
        </div>

        {/* 庫存分佈狀況 (依需求 8：主要顯示各位置數量、可現售數量；總庫存及預購保留為次要資訊) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-300">📍 庫存狀況與位置分佈</h4>
          </div>

          {/* 主要資訊：各位置數量 + 可現售數量 */}
          <div className="grid grid-cols-4 gap-2.5 text-center font-mono">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <span className="text-xs text-zinc-400 block mb-1">門市現貨</span>
              <span
                className={`text-2xl font-bold ${
                  storeStock > 0 ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {storeStock} 台
              </span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <span className="text-xs text-zinc-400 block mb-1">後方倉庫</span>
              <span className="text-2xl font-bold text-zinc-200">{warehouseStock} 台</span>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
              <span className="text-xs text-zinc-400 block mb-1">公司總倉</span>
              <span className="text-2xl font-bold text-zinc-200">{companyStock} 台</span>
            </div>
            <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/30 p-3 ring-1 ring-emerald-500/30">
              <span className="text-xs text-emerald-300 font-bold block mb-1">★ 可現售總量</span>
              <span
                className={`text-2xl font-extrabold ${
                  sellableTotal > 0 ? 'text-emerald-300' : 'text-rose-400'
                }`}
              >
                {sellableTotal} 台
              </span>
            </div>
          </div>

          {/* 次要資訊：總庫存 & 預購未取保留數量 */}
          <div className="flex items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/40 px-3 py-2 text-xs font-mono text-zinc-400">
            <div className="flex items-center gap-4">
              <span>全域總庫存：<strong className="text-zinc-200 text-sm">{currentProduct.totalStock}</strong> 台</span>
              <span>預購未取保留：<strong className="text-amber-300 text-sm">{preOrderPending}</strong> 台</span>
            </div>
            {isShortage && (
              <span className="text-amber-300 font-bold">
                ⚠️ 現貨不足以全數保留預購未取
              </span>
            )}

          </div>
        </div>

        {/* 彈窗底部操作按鈕 */}
        <div className="flex justify-end gap-3 pt-2">
          {onEdit && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                onEdit(currentProduct);
                onClose();
              }}
              className="text-sm font-semibold text-cyan-300 border-cyan-700/60 hover:bg-cyan-950/40"
            >
              ✏️ 編輯商品資訊
            </Button>
          )}
          <Button variant="ghost" size="md" onClick={onClose} className="text-sm">
            關閉
          </Button>
          {showAddToCart && onAddToCart && (
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                onAddToCart(currentProduct);
                onClose();
              }}
              className="text-sm font-bold"
            >
              🛒 加入待結清單 ({currentProduct.sku})
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
