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
  });

  it('looks siblings up in the given store scope and starts over when the scope changes', async () => {
    const byBarcode = vi
      .spyOn(productService, 'getProductsByBarcode')
      .mockImplementation(async (code, scope) => [product(`${code}-${scope?.storeName ?? (scope?.allProducts ? 'all' : 'login')}`, code)]);
    const { result, rerender } = renderHook(({ scope }) => useBarcodeSiblings(['111'], scope), {
      initialProps: { scope: { storeName: '台南快閃店' } as { storeName?: string; allProducts?: boolean } | undefined },
    });
    await waitFor(() => expect(result.current['111']?.map((p) => p.id)).toEqual(['111-台南快閃店']));
    expect(byBarcode).toHaveBeenLastCalledWith('111', { storeName: '台南快閃店' });

    rerender({ scope: { allProducts: true } });
    await waitFor(() => expect(result.current['111']?.map((p) => p.id)).toEqual(['111-all']));
    rerender({ scope: undefined });
    await waitFor(() => expect(result.current['111']?.map((p) => p.id)).toEqual(['111-login']));
    expect(byBarcode).toHaveBeenLastCalledWith('111');
  });

  it('treats a failed lookup as no siblings', async () => {
    vi.spyOn(productService, 'getProductsByBarcode').mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useBarcodeSiblings(['999']));
    await act(async () => {});
    await waitFor(() => expect(result.current['999']).toEqual([]));
  });
});
