import { useCallback, useEffect, useRef, useState } from 'react';
import { productService } from '@/services';
import { useCartStore, type CartItem } from '@/store/cartStore';

/** 擋住結帳的商品狀態。missing：後端已沒有這個商品。delisted：已下架，只能退貨。 */
export type UnavailableProducts = Record<string, 'missing' | 'delisted'>;

/** 這一行會被後端拒絕時回傳原因，可以結帳時回傳 null。 */
export function unavailableReason(item: CartItem, unavailable: UnavailableProducts): string | null {
  const state = unavailable[item.productId];
  if (state === 'missing') return '商品已不存在（可能已被刪除或資料庫已更換），請移除後再結帳';
  if (state === 'delisted' && item.quantity > 0) return '商品已下架，無法銷售，請移除後再結帳';
  return null;
}

export function blockingCartItems(items: CartItem[], unavailable: UnavailableProducts): CartItem[] {
  return items.filter((item) => unavailableReason(item, unavailable) !== null);
}

function cartProductKey(items: CartItem[]): string {
  return Array.from(new Set(items.map((item) => item.productId))).sort().join('\n');
}

/**
 * 購物車載入（含重新整理後從 localStorage 還原）或商品清單變動時，向後端逐一確認商品還在。
 * 只有後端明確回 PRODUCT_NOT_FOUND 或已下架才標示；斷線或逾時不標示，交給後端結帳時判斷。
 */
export function useCartProductCheck(items: CartItem[]) {
  const [unavailable, setUnavailable] = useState<UnavailableProducts>({});
  const latestRun = useRef(0);
  const productKey = cartProductKey(items);

  const revalidate = useCallback(async (): Promise<UnavailableProducts> => {
    const run = ++latestRun.current;
    const ids = Array.from(new Set(useCartStore.getState().items.map((item) => item.productId)));
    const checks = await Promise.all(
      ids.map(async (id) => [id, await productService.checkProductAvailability(id)] as const)
    );
    const next: UnavailableProducts = {};
    for (const [id, state] of checks) {
      if (state === 'missing' || state === 'delisted') next[id] = state;
    }
    if (run === latestRun.current) setUnavailable(next);
    return next;
  }, []);

  useEffect(() => {
    if (!productKey) {
      latestRun.current += 1;
      setUnavailable({});
      return;
    }
    void revalidate();
  }, [productKey, revalidate]);

  return { unavailable, revalidate };
}
