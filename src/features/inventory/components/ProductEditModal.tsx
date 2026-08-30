import { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import type { ModelScale, Product } from '@/types/product';
import { productService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';

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
  const [material, setMaterial] = useState('');
  const [color, setColor] = useState('');
  const [listPrice, setListPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [vipPrice, setVipPrice] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'active' | 'discontinued'>('active');

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setBrand(product.brand || '');
      setSku(product.sku || '');
      setBarcode(product.barcode || '');
      setName(product.name || '');
      setScale(product.scale || '1:18');
      setMaterial(product.material || '');
      setColor(product.color || '');
      setListPrice(String(product.listPrice ?? ''));
      setCostPrice(String(product.costPrice ?? ''));
      setVipPrice(product.vipPrice ? String(product.vipPrice) : '');
      setNote(product.note || '');
      setStatus(product.status || 'active');
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku.trim() || !name.trim() || !brand.trim()) {
      showToast('請填寫廠牌、貨號與車型品名', 'error');
      return;
    }

    const price = Number(listPrice);
    if (isNaN(price) || price < 0) {
      showToast('請輸入正確的門市定價', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await productService.updateProduct(product.id, {
        sku: sku.trim(),
        barcode: barcode.trim(),
        brand: brand.trim(),
        name: name.trim(),
        scale,
        material: material.trim() || undefined,
        color: color.trim() || undefined,
        listPrice: price,
        costPrice: Number(costPrice) || 0,
        vipPrice: vipPrice ? Number(vipPrice) : undefined,
        note: note.trim() || undefined,
        status,
      });

      showToast('🎉 商品資訊已成功更新！', 'success');
      onSuccess();
      onClose();
    } catch (err) {
      showToast('編輯儲存失敗，請重試', 'error');
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
            <label className="mb-1 block text-sm font-medium text-zinc-300">車型比例 *</label>
            <select
              value={scale}
              onChange={(e) => setScale(e.target.value as ModelScale)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-base text-zinc-100 focus:border-cyan-400 focus:outline-none"
            >
              {SCALE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 貨號與國際條碼 */}
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

        {/* 車型與塗裝品名 */}
        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-300">車型與塗裝品名 *</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如: Nissan Skyline GT-R R34 V-Spec II"
            required
          />
        </div>

        {/* 車身材質與原廠塗裝顏色 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">車身材質</label>
            <Input value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="合金 / 樹脂" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">原廠塗裝顏色</label>
            <Input value={color} onChange={(e) => setColor(e.target.value)} placeholder="例如: Bayside Blue" />
          </div>
        </div>

        {/* 門市定價、VIP 優惠價與進貨成本價 */}
        <div className="grid grid-cols-3 gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">門市定價 (TWD) *</label>
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
          <div>
            <label className="mb-1 block text-xs text-zinc-400">VIP 優惠價</label>
            <Input
              monospace
              type="number"
              min={0}
              value={vipPrice}
              onChange={(e) => setVipPrice(e.target.value)}
              placeholder="6200"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">進貨成本價</label>
            <Input
              monospace
              type="number"
              min={0}
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="4000"
            />
          </div>
        </div>

        {/* 販售狀態與備註說明 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-zinc-400">販售狀態</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'active' | 'discontinued')}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-cyan-400 focus:outline-none"
            >
              <option value="active">🟢 在庫販售</option>
              <option value="discontinued">🔴 已停產</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs text-zinc-400">備註說明 (選填)</label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如: 限量 500 台、首批附專屬卡..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? '儲存中...' : '確認儲存修改'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
