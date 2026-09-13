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
}

const SCALE_OPTIONS: ModelScale[] = ['1:18', '1:43', '1:64', '1:24', '1:12', '配件周邊'];

export function CreateProductModal({ open, onClose, onSuccess }: CreateProductModalProps) {
  const showToast = useToastStore((s) => s.showToast);

  const [brand, setBrand] = useState('AutoArt');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [scale, setScale] = useState<ModelScale>('1:18');
  const [spec, setSpec] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [note, setNote] = useState('');

  // Initial stock quantities
  const [storeStock, setStoreStock] = useState('0');
  const [warehouseStock, setWarehouseStock] = useState('0');
  const [companyStock, setCompanyStock] = useState('0');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // 每次進入彈窗時重置所有輸入欄位
  useEffect(() => {
    if (open) {
      setBrand('AutoArt');
      setSku('');
      setBarcode('');
      setName('');
      setScale('1:18');
      setSpec('');
      setListPrice('');
      setNote('');
      setStoreStock('0');
      setWarehouseStock('0');
      setCompanyStock('0');
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !brand.trim()) {
      showToast('請填寫廠牌、貨號與商品品名', 'error');
      return;
    }

    const price = Number(listPrice);
    if (isNaN(price) || price < 0) {
      showToast('請輸入正確的定價', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const storeQty = Math.max(0, Number(storeStock) || 0);
      const warehouseQty = Math.max(0, Number(warehouseStock) || 0);
      const companyQty = Math.max(0, Number(companyStock) || 0);

      const payload: CreateProductRequest = {
        sku: sku.trim(),
        barcode: barcode.trim() || `${Date.now()}`,
        brand: brand.trim(),
        name: name.trim(),
        scale,
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
            <label className="mb-1 block text-sm font-medium text-zinc-300">商品廠牌 (Brand) *</label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="例如: AutoArt, Spark, Mini GT"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">模型比例 *</label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value as ModelScale)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
            >
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
            <label className="mb-1 block text-sm font-medium text-zinc-300">商品貨號 (SKU) *</label>
            <Input
              monospace
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="例如: AA-79122"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">國際條碼 (Barcode)</label>
            <Input
              monospace
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="掃描或手動輸入條碼"
            />
          </div>
        </div>

        {/* 3. 商品品名 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">商品品名 *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: Nissan Skyline GT-R R34 V-Spec II"
            required
          />
        </div>

        {/* 4. 規格與定價 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">規格 (材質/顏色/變體)</label>
            <Input
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="例如: 灣岸藍 / 合金全開 / 限量版"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">門市定價 (TWD) *</label>
            <Input
              monospace
              type="number"
              min={0}
              value={listPrice}
              onChange={(e) => setListPrice(e.target.value)}
              placeholder="6800"
              required
            />
          </div>
        </div>

        {/* 5. 備註說明 */}
        <div>
          <label className="mb-1 block text-xs text-zinc-400">備註說明 (選填)</label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如: 限量 500 台、附壓克力展示盒..."
          />
        </div>

        {/* 6. 初始各地點進貨庫存數量 */}
        <div>
          <label className="mb-2 block text-sm font-medium text-cyan-400">
            📍 初始各地點進貨庫存數量 (建檔後寫入暫存草稿)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
              <span className="block text-xs text-emerald-400 mb-1">門市現貨</span>
              <Input
                monospace
                type="number"
                min={0}
                value={storeStock}
                onChange={(e) => setStoreStock(e.target.value)}
              />
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
              <span className="block text-xs text-zinc-400 mb-1">後方倉庫</span>
              <Input
                monospace
                type="number"
                min={0}
                value={warehouseStock}
                onChange={(e) => setWarehouseStock(e.target.value)}
              />
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-2.5">
              <span className="block text-xs text-zinc-400 mb-1">公司總倉</span>
              <Input
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
