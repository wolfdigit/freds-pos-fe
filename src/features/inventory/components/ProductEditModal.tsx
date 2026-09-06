import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { ModelScale, Product, UpdateProductRequest } from '@/types/product';
import { productService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import { BusinessError } from '@/utils/errors';
import { ApiError } from '@/services/api/httpClient';

interface ProductEditModalProps {
  product: Product | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SCALE_OPTIONS: ModelScale[] = ['1:18', '1:43', '1:64', '1:24', '1:12', '配件周邊'];

export function ProductEditModal({ product, onClose, onSuccess }: ProductEditModalProps) {
  const showToast = useToastStore((s) => s.showToast);

  const [brand, setBrand] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [scale, setScale] = useState<ModelScale>('1:18');
  const [spec, setSpec] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [note, setNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setBrand(product.brand || '');
      setSku(product.sku || '');
      setBarcode(product.barcode || '');
      setName(product.name || '');
      setScale(product.scale || '1:18');
      setSpec(product.spec || '');
      setListPrice(String(product.listPrice ?? ''));
      setNote(product.note || '');
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !brand.trim()) {
      showToast('請填寫廠牌、貨號與商品品名', 'error');
      return;
    }

    const price = Number(listPrice);
    if (isNaN(price) || price < 0) {
      showToast('請輸入正確的門市定價', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const updates: UpdateProductRequest = {
        sku: sku.trim(),
        barcode: barcode.trim(),
        brand: brand.trim(),
        name: name.trim(),
        scale,
        spec: spec.trim() || undefined,
        listPrice: price,
        note: note.trim() || undefined,
      };

      await productService.updateProduct(product.id, updates);

      showToast('🎉 商品資訊已成功更新！', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      if (err instanceof BusinessError) {
        showToast(err.message, 'error');
      } else if (err instanceof ApiError && (err.responseBody as any)?.message) {
        showToast((err.responseBody as any).message, 'error');
      } else {
        showToast('編輯儲存失敗，請重試', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={!!product} onClose={onClose} title={`✏️ 編輯商品資訊：${product.sku}`}>
      <form onSubmit={handleSubmit} className="space-y-4 text-base">
        {/* 廠牌與比例 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">廠牌 / 品牌 *</label>
            <Input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="例如: AutoArt, Spark"
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

        {/* 貨號與條碼 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">貨號 (SKU) *</label>
            <Input
              monospace
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="例如: AA-79121"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">國際條碼 (Barcode)</label>
            <Input
              monospace
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="條碼"
            />
          </div>
        </div>

        {/* 商品品名 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">商品品名 *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="商品品名"
            required
          />
        </div>

        {/* 規格與定價 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">規格 (材質/顏色/變體)</label>
            <Input
              value={spec}
              onChange={(e) => setSpec(e.target.value)}
              placeholder="例如: 灣岸藍 / 合金全開"
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

        {/* 備註 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">備註說明 (選填)</label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="備註說明..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? '儲存中...' : '確認更新'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
