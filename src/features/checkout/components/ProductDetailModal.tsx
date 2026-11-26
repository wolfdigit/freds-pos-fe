import { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/feedback/Spinner';
import { formatCurrency } from '@/utils/currency';
import { formatLoginStoreQuantity, inventoryQuantity, type Product } from '@/types/product';
import { productService } from '@/services';
import { useLocations } from '@/features/inventory/hooks/useLocations';
import {
  PRODUCT_DETAIL_LOCATION_ROLES,
  formatFeaturedLocationRoles,
  resolveFeaturedLocations,
  type FeaturedLocationRole,
} from '@/features/inventory/featuredLocations';
import { useSessionStore } from '@/store/sessionStore';

const DETAIL_ROLE_LABELS: Record<FeaturedLocationRole, string> = {
  storeSale: '門市可售',
  storePreorder: '門市預購保留',
  storeReturned: '門市退貨',
  systemCompany: '系統總倉',
  systemPreorder: '系統預購保留',
  systemReturned: '系統退貨',
};

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
  const storeName = useSessionStore((s) => s.storeName);
  const { locations } = useLocations();
  const [activeProduct, setActiveProduct] = useState<Product | null>(product);
  const [siblingProducts, setSiblingProducts] = useState<Product[]>([]);
  const [siblingsLoading, setSiblingsLoading] = useState(false);

  const featuredLocations = useMemo(
    () => resolveFeaturedLocations(locations, storeName, PRODUCT_DETAIL_LOCATION_ROLES),
    [locations, storeName]
  );

  useEffect(() => {
    setActiveProduct(product);
  }, [product]);

  useEffect(() => {
    if (!open || !activeProduct) {
      setSiblingProducts([]);
      setSiblingsLoading(false);
      return;
    }

    if (activeProduct.barcode) {
      if (allProducts && allProducts.length > 0) {
        const siblings = allProducts.filter(
          (p) => p.barcode === activeProduct.barcode && p.barcode !== ''
        );
        setSiblingProducts(siblings);
        setSiblingsLoading(false);
      } else {
        // 若未傳入 allProducts，用條碼完全相符查詢同條碼商品
        let cancelled = false;
        setSiblingsLoading(true);
        productService
          .getProductsByBarcode(activeProduct.barcode)
          .then((res) => {
            if (cancelled) return;
            const siblings = res.filter((p) => p.barcode === activeProduct.barcode);
            if (siblings.length > 1) {
              setSiblingProducts(siblings);
            } else {
              setSiblingProducts([activeProduct]);
            }
          })
          .catch((err) => {
            console.error(err);
            if (!cancelled) setSiblingProducts([activeProduct]);
          })
          .finally(() => {
            if (!cancelled) setSiblingsLoading(false);
          });
        return () => {
          cancelled = true;
        };
      }
    } else {
      setSiblingProducts([activeProduct]);
      setSiblingsLoading(false);
    }
  }, [open, activeProduct?.barcode, allProducts]);

  if (!activeProduct) return null;

  const currentProduct = activeProduct;
  const sellable = currentProduct.loginStoreQuantity;
  const preorderQty = currentProduct.loginStorePreorderQuantity;
  const returnedQty = currentProduct.loginStoreReturnedQuantity;
  const sellableKnown = typeof sellable === 'number';
  const hasMultipleSkus = siblingProducts.length > 1;
  const featuredIds = new Set(featuredLocations.map((entry) => entry.location.id));
  const otherInventories = currentProduct.inventories.filter((row) => !featuredIds.has(row.location));
  const featuredGridClass =
    featuredLocations.length === 1
      ? 'grid-cols-1'
      : featuredLocations.length === 2 || featuredLocations.length === 4
        ? 'grid-cols-2'
        : 'grid-cols-2 sm:grid-cols-3';

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
          {siblingsLoading && (
            <div className="mt-2 flex items-center gap-2 text-sm text-zinc-400">
              <Spinner size="sm" />
              <span>載入同條碼貨號中...</span>
            </div>
          )}
        </div>

        {/* 同條碼多貨號切換下拉選單 (依需求 6) */}
        {hasMultipleSkus && (
          <div className="rounded-xl border border-cyan-800/60 bg-cyan-950/30 p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-cyan-300 font-bold text-sm">同條碼其他貨號：</span>
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

        {/* 庫存分佈狀況 (依需求 8：主要顯示各位置數量、可現售數量；總庫存為次要資訊) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-300">庫存狀況與位置分佈</h4>
            <span className="text-xs font-mono text-zinc-400">
              全據點合計 <strong className="text-zinc-200">{currentProduct.totalInventory} 台</strong>
            </span>
          </div>

          {/* 主要資訊：門市綁定與系統預設地點（重疊合併） */}
          {featuredLocations.length > 0 ? (
            <div className={`grid ${featuredGridClass} gap-2.5 text-center font-mono`}>
              {featuredLocations.map((entry) => {
                const isStoreSale = entry.roles.includes('storeSale');
                const roleLabel = formatFeaturedLocationRoles(entry.roles, DETAIL_ROLE_LABELS);
                const qty = inventoryQuantity(currentProduct, entry.location.id);
                return (
                  <div
                    key={entry.location.id}
                    className={
                      isStoreSale
                        ? 'rounded-xl border border-emerald-800/80 bg-emerald-950/30 p-3 ring-1 ring-emerald-500/30'
                        : 'rounded-xl border border-zinc-800 bg-zinc-950 p-3'
                    }
                  >
                    <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-left">
                      <span
                        className={`truncate text-base font-bold ${isStoreSale ? 'text-emerald-200' : 'text-zinc-100'}`}
                        title={entry.location.name}
                      >
                        {entry.location.name}
                      </span>
                      <span
                        className={`truncate text-sm ${isStoreSale ? 'text-emerald-300/90' : 'text-zinc-400'}`}
                        title={roleLabel}
                      >
                        {roleLabel}
                      </span>
                    </div>
                    <span
                      className={`text-2xl font-extrabold ${
                        isStoreSale ? (qty > 0 ? 'text-emerald-300' : 'text-amber-400') : 'text-zinc-200'
                      }`}
                    >
                      {qty} 台
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
              <div className="rounded-xl border border-emerald-800/80 bg-emerald-950/30 p-3 ring-1 ring-emerald-500/30">
                <span className="text-xs text-emerald-300 font-bold block mb-1">門市可售</span>
                <span className={`text-2xl font-extrabold ${sellableKnown && sellable > 0 ? 'text-emerald-300' : sellableKnown ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {sellableKnown ? `${sellable} 台` : '—'}
                </span>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <span className="text-xs text-zinc-400 block mb-1">門市預購保留</span>
                <span className="text-2xl font-bold text-zinc-200">
                  {formatLoginStoreQuantity(preorderQty)}{typeof preorderQty === 'number' ? ' 台' : ''}
                </span>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3">
                <span className="text-xs text-zinc-400 block mb-1">門市退貨</span>
                <span className="text-2xl font-bold text-zinc-200">
                  {formatLoginStoreQuantity(returnedQty)}{typeof returnedQty === 'number' ? ' 台' : ''}
                </span>
              </div>
            </div>
          )}

          {/* 其他地點保留小字列出 */}
          {otherInventories.length > 0 && (
            <div className="flex flex-wrap gap-2 text-xs font-mono text-zinc-400">
              {otherInventories.map((row) => (
                <span key={row.location} className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1">
                  {row.locationName} {row.quantity}
                </span>
              ))}
            </div>
          )}
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
              編輯商品資訊
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
              加入待結清單 ({currentProduct.sku})
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
