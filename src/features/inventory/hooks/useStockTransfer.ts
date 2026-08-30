import { useState } from 'react';
import type { StockLocation } from '@/types/product';
import { productService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import { BusinessError } from '@/utils/errors';

export function useStockTransfer(onSuccess: () => void) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const showToast = useToastStore((s) => s.showToast);

  const transfer = async (
    productId: string,
    fromLocation: StockLocation,
    toLocation: StockLocation,
    quantity: number
  ) => {
    setIsSubmitting(true);
    try {
      await productService.transferStock({ productId, fromLocation, toLocation, quantity });
      showToast('庫存調撥完成', 'success');
      onSuccess();
      return true;
    } catch (err) {
      showToast(err instanceof BusinessError ? err.message : '調撥失敗', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { transfer, isSubmitting };
}
