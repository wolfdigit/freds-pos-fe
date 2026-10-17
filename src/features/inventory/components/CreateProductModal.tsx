import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { ModelScale, Product, StockLocation, CreateProductRequest } from '@/types/product';
import { productService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import { BusinessError } from '@/utils/errors';
import { ApiError } from '@/services/api/httpClient';

interface CreateProductModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (product: Product, initialDrafts?: Record<StockLocation, number>) => void;
  initialKeyword?: string;
}

const SCALE_OPTIONS: ModelScale[] = ['1:18', '1:43', '1:64', '1:24', '1:12', '配件周邊'];

export function CreateProductModal({ open, onClose, onSuccess, initialKeyword = '' }: CreateProductModalProps) {
  const showToast = useToastStore((s) => s.showToast);

  const [brand, setBrand] = useState('AutoArt');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [scale, setScale] = useState<string>('');
  const [spec, setSpec] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [note, setNote] = useState('');

  // Initial stock quantities
  const [storeStock, setStoreStock] = useState('0');
  const [warehouseStock, setWarehouseStock] = useState('0');
  const [companyStock, setCompanyStock] = useState('0');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // 每次進入彈窗時重置欄位，並帶入結帳搜尋關鍵字
  useEffect(() => {
    if (open) {
      const seed = initialKeyword.trim();
      const looksLikeSku = seed.length > 0 && !/\s/.test(seed);
      setBrand('AutoArt');
      setSku(looksLikeSku ? seed : '');
      setBarcode('');
      setName(seed);
      setScale('');
      setSpec('');
      setListPrice('');
      setNote('');
      setStoreStock('0');
      setWarehouseStock('0');
      setCompanyStock('0');
      setErrors({});
    }
  }, [open, initialKeyword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!brand.trim()) next.brand = '請填寫商品廠牌';
    if (!sku.trim()) next.sku = '請填寫商品貨號';
    if (!barcode.trim()) next.barcode = '請填寫國際條碼';
    if (!name.trim()) next.name = '請填寫商品品名';
    const price = Number(listPrice);
    if (listPrice.trim() === '' || Number.isNaN(price) || price < 0) next.listPrice = '請填寫正確的建議售價';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setIsSubmitting(true);
    try {
      const storeQty = Math.max(0, Number(storeStock) || 0);
      const warehouseQty = Math.max(0, Number(warehouseStock) || 0);
      const companyQty = Math.max(0, Number(companyStock) || 0);

      const payload: CreateProductRequest = {
        sku: sku.trim(),
        barcode: barcode.trim(),
        brand: brand.trim(),
        name: name.trim(),
        scale: scale || undefined,
        spec: spec.trim() || undefined,
        listPrice: price,
        note: note.trim() || undefined,
      };

      const created = await productService.createProduct(payload);

      const hasInitialStocks = storeQty > 0 || warehouseQty > 0 || companyQty > 0;
      const initialDrafts: Record<StockLocation, number> | undefined = hasInitialStocks
        ? { store: storeQty, warehouse: warehouseQty, company: companyQty, other: 0 }
        : undefined;

      if (hasInitialStocks) {
        showToast('🎉 新商品建檔成功！初始庫存已載入編輯列表，請點擊【儲存庫存變更】存檔', 'success');
      } else {
        showToast('🎉 新商品建檔成功！', 'success');
      }
      onSuccess(created, initialDrafts);
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err instanceof BusinessError) {
        showToast(err.message, 'error');
      } else if (err instanceof ApiError && (err.responseBody as any)?.message) {
        showToast((err.responseBody as any).message, 'error');
      } else if (err instanceof ApiError) {
        showToast(err.message, 'error');
      } else {
        showToast('建立商品失敗，請檢查資料', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="✨ 新增模型商品建檔" widthClassName="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        {/* 1. 廠牌與比例 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="create-product-brand" className="mb-1 block text-sm font-medium text-zinc-300">商品廠牌 (Brand) *</label>
            <Input
              id="create-product-brand"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="例如: AutoArt, Spark, Mini GT"
            />
            {errors.brand && <p className="mt-1 text-xs font-medium text-rose-300">{errors.brand}</p>}
          </div>
          <div>
            <label htmlFor="create-product-scale" className="mb-1 block text-sm font-medium text-zinc-300">模型比例 (選填)</label>
            <select
              id="create-product-scale"
              value={scale}
              onChange={(e) => setScale(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
            >
              <option value="">-- 無 / 未指定比例 --</option>
              {SCALE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 2. 貨號與國際條碼 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="create-product-sku" className="mb-1 block text-sm font-medium text-zinc-300">商品貨號 (SKU) *</label>
            <Input
              id="create-product-sku"
              monospace
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="例如: AA-79122"
            />
            {errors.sku && <p className="mt-1 text-xs font-medium text-rose-300">{errors.sku}</p>}
          </div>
          <div>
            <label htmlFor="create-product-barcode" className="mb-1 block text-sm font-medium text-zinc-300">國際條碼 (Barcode) *</label>
            <Input
              id="create-product-barcode"
              monospace
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="掃描或手動輸入國際條碼"
            />
            {errors.barcode && <p className="mt-1 text-xs font-medium text-rose-300">{errors.barcode}</p>}
          </div>
        </div>

        {/* 3. 商品品名 */}
        <div>
          <label htmlFor="create-product-name" className="mb-1 block text-sm font-medium text-zinc-300">商品品名 *</label>
          <Input
            id="create-product-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: Nissan Skyline GT-R R34 V-Spec II"
          />
          {errors.name && <p className="mt-1 text-xs font-medium text-rose-300">{errors.name}</p>}
        </div>

        {/* 4. 定價與規格 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="create-product-price" className="mb-1 block text-sm font-medium text-zinc-300">建議售價 (MSRP / 門市定價) *</label>
            <Input
              id="create-product-price"
              monospace
              type="number"
              min={0}
              value={listPrice}
              onChange={(e) => setListPrice(e.target.value)}
              placeholder="例如 630"
            />
            {errors.listPrice && <p className="mt-1 text-xs font-medium text-rose-300">{errors.listPrice}</p>}
          </div>
          <div>
            <label htmlFor="create-product-spec" className="mb-1 block text-sm font-medium text-zinc-300">規格說明 (選填)</label>
            <Input
              id="create-product-spec"
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="例如: 吊卡版 / 盒裝版 / Chase"
            />
          </div>
        </div>

        {/* 5. 備註說明 */}
        <div>
          <label htmlFor="create-product-note" className="mb-1 block text-xs text-zinc-400">備註說明 (選填)</label>
          <Input
            id="create-product-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如: 現貨6、美國限定..."
          />
        </div>

        {/* 6. 初始各地點進貨庫存數量 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-cyan-400">
            📍 初始各地點進貨庫存數量 (建檔後寫入暫存草稿)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
              <label htmlFor="create-product-stock-store" className="mb-1 block text-xs text-emerald-400">門市現貨</label>
              <Input
                id="create-product-stock-store"
                monospace
                type="number"
                min={0}
                value={storeStock}
                onChange={(e) => setStoreStock(e.target.value)}
              />
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
              <label htmlFor="create-product-stock-warehouse" className="mb-1 block text-xs text-zinc-400">後方倉庫</label>
              <Input
                id="create-product-stock-warehouse"
                monospace
                type="number"
                min={0}
                value={warehouseStock}
                onChange={(e) => setWarehouseStock(e.target.value)}
              />
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
              <label htmlFor="create-product-stock-company" className="mb-1 block text-xs text-zinc-400">公司總倉</label>
              <Input
                id="create-product-stock-company"
                monospace
                type="number"
                min={0}
                value={companyStock}
                onChange={(e) => setCompanyStock(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? '建檔中...' : '確認建檔'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
