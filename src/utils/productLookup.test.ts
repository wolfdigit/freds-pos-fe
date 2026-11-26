import { afterEach, describe, expect, it, vi } from 'vitest';
import { productService } from '@/services';
import type { Product } from '@/types/product';
import { findExactProduct } from './productLookup';

function product(sku: string, barcode = sku): Product {
  return { id: `prod-${sku}`, sku, barcode, inventories: [] } as unknown as Product;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('findExactProduct', () => {
  it('sends allProducts on the barcode lookup so unlisted products can still match', async () => {
    const byBarcode = vi.spyOn(productService, 'getProductsByBarcode').mockResolvedValue([product('C', 'BAR-C')]);
    const search = vi.spyOn(productService, 'searchProductPage');
    const result = await findExactProduct('BAR-C', { allProducts: true });
    expect(byBarcode).toHaveBeenCalledWith('BAR-C', { allProducts: true });
    expect(search).not.toHaveBeenCalled();
    expect(result.exact?.sku).toBe('C');
  });

  it('uses the barcode lookup without allProducts by default', async () => {
    vi.spyOn(productService, 'getProductsByBarcode').mockResolvedValue([product('D', 'BAR-D')]);
    const result = await findExactProduct('BAR-D');
    expect(productService.getProductsByBarcode).toHaveBeenCalledWith('BAR-D', undefined);
    expect(result.exact?.sku).toBe('D');
  });
});
