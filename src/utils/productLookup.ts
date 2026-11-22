import { productService } from '@/services';
import { MAX_PRODUCT_PAGE_SIZE, type Product, type ProductPage } from '@/types/product';
import { normalizeSku } from './skuNormalizer';

/** 條碼完全相同，或貨號（含去 dash 規格化後）完全相同。 */
export function exactProductMatcher(query: string) {
  const code = query.trim();
  const lower = code.toLowerCase();
  const normalized = normalizeSku(code);
  return (p: Product) =>
    p.barcode === code ||
    p.sku.toLowerCase() === lower ||
    (normalized !== '' && (p.normalizedSku || normalizeSku(p.sku)) === normalized);
}

export interface ExactLookupOptions {
  /** 不套用登入門市的商品清單（庫存頁勾了「顯示全部商品」時）。 */
  allProducts?: boolean;
}

export interface ExactLookupResult {
  /** 條碼或貨號完全相符的商品；沒有時為 null。 */
  exact: Product | null;
  /** 不分品牌的關鍵字搜尋第一頁（有查才有），呼叫端可拿來做模糊比對的備案。 */
  page: ProductPage | null;
}

/**
 * 掃條碼 / 輸入貨號的完全比對。**不套用任何品牌、比例篩選**，只跟著登入門市的商品清單
 * （後端 GET /products 已處理；allProducts 時略過清單）。
 *
 * 1. 先用條碼查（GET /products?barcode=，最便宜）。
 * 2. 查不到再用關鍵字搜尋第一頁（最多 MAX_PRODUCT_PAGE_SIZE 筆），挑條碼或貨號完全相符的。
 */
export async function findExactProduct(query: string, options: ExactLookupOptions = {}): Promise<ExactLookupResult> {
  const code = query.trim();
  if (!code) return { exact: null, page: null };
  const isExact = exactProductMatcher(code);
  if (!options.allProducts) {
    try {
      const byBarcode = (await productService.getProductsByBarcode(code)).find(isExact);
      if (byBarcode) return { exact: byBarcode, page: null };
    } catch {
      // 條碼查詢失敗就繼續用關鍵字找。
    }
  }
  try {
    const page = await productService.searchProductPage({
      keyword: code,
      brand: 'ALL',
      ...(options.allProducts ? { allProducts: true } : {}),
      page: 1,
      pageSize: MAX_PRODUCT_PAGE_SIZE,
    });
    return { exact: page.items.find(isExact) ?? null, page };
  } catch {
    return { exact: null, page: null };
  }
}
