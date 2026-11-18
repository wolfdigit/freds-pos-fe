import { useEffect, useMemo, useState } from 'react';
import { productService } from '@/services';
import type { Product } from '@/types/product';

/**
 * 依條碼查同條碼的所有貨號（取代一次抓全部商品再比對）。
 * 每個條碼在這個元件存活期間只查一次；查詢失敗的條碼回空陣列。
 */
export function useBarcodeSiblings(barcodes: readonly (string | null | undefined)[]): Record<string, Product[]> {
  const key = useMemo(
    () =>
      [...new Set(barcodes.map((code) => (code ?? '').trim()).filter(Boolean))]
        .sort()
        .join('\n'),
    [barcodes]
  );
  const [byBarcode, setByBarcode] = useState<Record<string, Product[]>>({});

  useEffect(() => {
    const wanted = key ? key.split('\n') : [];
    const missing = wanted.filter((code) => !(code in byBarcode));
    if (missing.length === 0) return;
    let cancelled = false;
    void Promise.all(
      missing.map(async (code) => {
        try {
          return [code, await productService.getProductsByBarcode(code)] as const;
        } catch {
          return [code, [] as Product[]] as const;
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      setByBarcode((current) => ({ ...current, ...Object.fromEntries(entries) }));
    });
    return () => {
      cancelled = true;
    };
    // byBarcode 只用來判斷哪些條碼還沒查過，不需要因為它改變而重跑。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return byBarcode;
}
