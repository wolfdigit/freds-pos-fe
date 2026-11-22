import { useRef, useState } from 'react';
import { checkoutService } from '@/services';
import { useCartStore } from '@/store/cartStore';
import { useSessionStore } from '@/store/sessionStore';
import { useToastStore } from '@/components/feedback/toastStore';
import { getBoundCartUserId } from '@/auth/cartOwner';
import { ApiError } from '@/services/api/httpClient';
import { BusinessError } from '@/utils/errors';
import type { CheckoutReceipt, CreateOrderPayload, PaymentTender } from '@/types/checkout';
import { checkoutFingerprint, clearCheckoutKey, getOrCreateCheckoutKey } from '../checkoutIdempotency';

/**
 * 逾時、斷線、閘道錯誤時，後端可能已經建立訂單，只是回應沒回來。
 * 這些情況用同一把 key 重送是安全的：後端會回傳原本那張單。
 */
const UNCERTAIN_STATUSES = new Set([0, 408, 502, 503, 504]);

export function isUncertainCheckoutError(err: unknown): boolean {
  return err instanceof ApiError && UNCERTAIN_STATUSES.has(err.status);
}

const CART_PRODUCT_REJECTED_CODES = new Set(['PRODUCT_NOT_FOUND', 'PRODUCT_NOT_IN_STORE']);

/** 後端明確回覆商品不存在、已下架或本門市未販售。交易已整筆回滾，不重送。 */
export function isProductNotFoundError(err: unknown): boolean {
  return (
    (err instanceof ApiError || err instanceof BusinessError) && CART_PRODUCT_REJECTED_CODES.has(err.code ?? '')
  );
}

export const CHECKOUT_PRODUCT_NOT_FOUND_MESSAGE =
  '結帳失敗，沒有建立訂單：購物車裡有商品已不存在、已下架或本門市未販售。請移除標示紅色的商品後再結帳。';

export const CHECKOUT_UNCERTAIN_MESSAGE =
  '結帳結果未確認：連線逾時或中斷，訂單可能已經建立。請直接再按一次結帳，系統會用同一筆請求重送，不會重複建單；若仍失敗，請先到銷售紀錄確認。';

interface CheckoutWorkflowOptions {
  /** 後端回 PRODUCT_NOT_FOUND 或 PRODUCT_NOT_IN_STORE 時呼叫，讓畫面重新檢查並標示購物車商品。 */
  onProductNotFound?: () => void;
}

export function useCheckoutWorkflow({ onProductNotFound }: CheckoutWorkflowOptions = {}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inFlight = useRef(false);
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const { items, attachedCustomer, shippingFee, orderNote, clearCart } = useCartStore();
  const showToast = useToastStore((s) => s.showToast);

  const submitCheckout = async (payments: PaymentTender[]) => {
    // 檢查退貨數量限制
    const overReturnItem = items.find(
      (i) => i.quantity < 0 && i.maxReturnableQty !== undefined && Math.abs(i.quantity) > i.maxReturnableQty
    );
    if (overReturnItem) {
      showToast(
        `「${overReturnItem.name}」退貨數量超出原單可退上限 (${overReturnItem.maxReturnableQty}件)，請調整後再送出`,
        'error'
      );
      return null;
    }
    const storeName = useSessionStore.getState().storeName.trim();
    if (!storeName) {
      showToast('請先在上方選擇登入門市，才能結帳或辦理退貨。', 'warning');
      return null;
    }

    if (inFlight.current) return null;
    inFlight.current = true;
    setIsSubmitting(true);
    try {
      // 門市與收銀員由後端 session 決定。不要在 body 帶 branchId。
      // 庫存仍走既有的門市現貨檢查，換登入門市不會改扣其他庫存據點。
      const payload: CreateOrderPayload = {
        customerId: attachedCustomer?.id,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          isManualPrice: i.isManualPrice,
          priceDiffReason: i.priceChangeReason,
          // 點數折抵列：unitPrice 已是扣過 360 的價格，後端照收並記錄這一列由點數折抵。
          ...(i.pointsDiscountApplied ? { pointsDiscountApplied: true } : {}),
          // 預購取貨：後端改從登入門市的預購保留地點扣庫存。
          ...(i.preorderPickup && i.quantity > 0 ? { preorderPickup: true } : {}),
          originalOrderId: (i as any).originalOrderId,
          originalOrderItemId: (i as any).originalOrderItemId,
          restock: (i as any).restock ?? true,
          returnReason: (i as any).returnReason,
        })),
        shippingFee,
        payments,
        note: orderNote,
      };

      // 同一筆結帳（內容不變）不論重按幾次、重新整理幾次，都沿用同一把 key。
      const idempotencyKey = getOrCreateCheckoutKey(
        checkoutFingerprint(payload, { userId: getBoundCartUserId(), storeName })
      );

      let result: CheckoutReceipt;
      try {
        result = await checkoutService.createCheckoutOrder(payload, idempotencyKey);
      } catch (err) {
        if (!isUncertainCheckoutError(err)) throw err;
        // 結果不明：用同一把 key 自動重送一次，後端若已建單會直接回傳原單。
        result = await checkoutService.createCheckoutOrder(payload, idempotencyKey);
      }

      clearCheckoutKey();
      setReceipt(result);
      clearCart();
      showToast(`結帳完成！單號 ${result.order.orderNumber}`, 'success');
      return result;
    } catch (err) {
      if (isUncertainCheckoutError(err)) {
        // 保留 key，讓收銀員重按時仍是同一筆請求。
        showToast(CHECKOUT_UNCERTAIN_MESSAGE, 'warning', 10000);
      } else if (isProductNotFoundError(err)) {
        // 確定失敗、沒有建單。移除商品後是另一筆請求，用新 key。
        clearCheckoutKey();
        const detail = err instanceof Error && err.message ? `（${err.message}）` : '';
        showToast(`${CHECKOUT_PRODUCT_NOT_FOUND_MESSAGE}${detail}`, 'error', 10000);
        onProductNotFound?.();
      } else if (err instanceof BusinessError) {
        showToast(err.message, 'error');
      } else if (err instanceof ApiError) {
        if (err.code === 'IDEMPOTENCY_CONFLICT') clearCheckoutKey();
        showToast(err.message || '結帳失敗，請稍後再試', 'error');
      } else {
        showToast('結帳失敗，請稍後再試', 'error');
      }
      return null;
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  return { isSubmitting, receipt, setReceipt, submitCheckout };
}
