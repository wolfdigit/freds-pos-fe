import { useEffect, useMemo, useState } from 'react';
import { productService } from '@/services';
import { storeScopeParams, type Product, type ProductStoreScope } from '@/types/product';

/**
 * 依條碼查同條碼的所有貨號（取代一次抓全部商品再比對）。
 * 每個條碼在這個元件存活期間只查一次；查詢失敗的條碼回空陣列。
 * scope：看哪間門市的商品清單（庫存頁的快速進貨跟著所選門市）；不帶時看登入門市。
 * scope 改變時全部重查。
 */
export function useBarcodeSiblings(
  barcodes: readonly (string | null | undefined)[],
  scope?: ProductStoreScope
): Record<string, Product[]> {
  const key = useMemo(
    () =>
      [...new Set(barcodes.map((code) => (code ?? '').trim()).filter(Boolean))]
        .sort()
        .join('\n'),
    [barcodes]
  );
  const scopeKey = JSON.stringify(storeScopeParams(scope));
  const [cache, setCache] = useState<{ scopeKey: string; byBarcode: Record<string, Product[]> }>({
    scopeKey,
    byBarcode: {},
  });
  const byBarcode = cache.scopeKey === scopeKey ? cache.byBarcode : {};

  useEffect(() => {
    const wanted = key ? key.split('\n') : [];
    const missing = wanted.filter((code) => !(code in byBarcode));
    if (missing.length === 0) return;
    const params = JSON.parse(scopeKey) as ProductStoreScope;
    const hasScope = Object.keys(params).length > 0;
    let cancelled = false;
    void Promise.all(
      missing.map(async (code) => {
        try {
          const rows = hasScope
            ? await productService.getProductsByBarcode(code, params)
            : await productService.getProductsByBarcode(code);
          return [code, rows] as const;
        } catch {
          return [code, [] as Product[]] as const;
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      setCache((current) => ({
        scopeKey,
        byBarcode: { ...(current.scopeKey === scopeKey ? current.byBarcode : {}), ...Object.fromEntries(entries) },
      }));
    });
    return () => {
      cancelled = true;
    };
    // byBarcode 只用來判斷哪些條碼還沒查過，不需要因為它改變而重跑。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, scopeKey]);

  return byBarcode;
}
