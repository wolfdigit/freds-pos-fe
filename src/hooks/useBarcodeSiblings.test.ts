import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { productService } from '@/services';
import type { Product } from '@/types/product';
import { useBarcodeSiblings } from './useBarcodeSiblings';

function product(id: string, barcode: string): Product {
  return { id, barcode, inventories: [] } as unknown as Product;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useBarcodeSiblings', () => {
  it('looks up each distinct barcode once and never loads the whole catalog', async () => {
    const byBarcode = vi
      .spyOn(productService, 'getProductsByBarcode')
      .mockImplementation(async (code) => [product(`${code}-1`, code), product(`${code}-2`, code)]);
    const full = vi.spyOn(productService, 'searchProducts');
    const { result, rerender } = renderHook(({ codes }) => useBarcodeSiblings(codes), {
      initialProps: { codes: ['111', '', null, '111', '222'] as (string | null)[] },
    });
    await waitFor(() => expect(Object.keys(result.current).sort()).toEqual(['111', '222']));
    expect(result.current['111'].map((p) => p.id)).toEqual(['111-1', '111-2']);
    expect(byBarcode).toHaveBeenCalledTimes(2);

    // 同樣的條碼換了陣列參照不重查；新增的條碼才查。
    rerender({ codes: ['222', '111', '333'] });
    await waitFor(() => expect(result.current['333']).toBeDefined());
    expect(byBarcode).toHaveBeenCalledTimes(3);
    expect(full).not.toHaveBeenCalled();
  });

  it('treats a failed lookup as no siblings', async () => {
    vi.spyOn(productService, 'getProductsByBarcode').mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useBarcodeSiblings(['999']));
    await act(async () => {});
    await waitFor(() => expect(result.current['999']).toEqual([]));
  });
});
