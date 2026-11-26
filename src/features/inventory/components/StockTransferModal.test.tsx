import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Product } from '@/types/product';

const transferStock = vi.fn().mockResolvedValue(true);
const moveAllStock = vi.fn().mockResolvedValue(true);

vi.mock('@/services', () => ({
  productService: {
    transferStock: (...args: unknown[]) => transferStock(...args),
    moveAllStock: (...args: unknown[]) => moveAllStock(...args),
  },
}));

vi.mock('../hooks/useLocations', () => ({
  useLocations: () => ({
    locations: [
      { id: 'loc-store', name: '門市現貨', icon: '🏪', storeNames: [], returnedStoreNames: [], preorderStoreNames: [] },
      { id: 'loc-wh', name: '後方倉庫', icon: '📦', storeNames: [], returnedStoreNames: [], preorderStoreNames: [] },
    ],
  }),
}));

import { StockTransferModal } from './StockTransferModal';

const sampleProduct: Product = {
  id: 'prod-1',
  sku: '18-56801CL16',
  normalizedSku: '1856801CL16',
  barcode: '18-56801CL16',
  name: 'Ferrari SF-25 CL16',
  brand: 'Bburago',
  listPrice: 1500,
  status: 'active',
  totalInventory: 11,
  loginStoreQuantity: 2,
  loginStoreReturnedQuantity: 0,
  inventories: [
    { location: 'loc-store', locationName: '門市現貨', quantity: 2 },
    { location: 'loc-wh', locationName: '後方倉庫', quantity: 9 },
  ],
};

describe('StockTransferModal 調撥原因', () => {
  beforeEach(() => {
    transferStock.mockClear();
    moveAllStock.mockClear();
  });

  it('omits reason when left blank on single-product transfer', async () => {
    const onTransferred = vi.fn();
    render(<StockTransferModal product={sampleProduct} onClose={vi.fn()} onTransferred={onTransferred} />);

    expect(screen.getByLabelText('4. 調撥原因')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '調撥這個商品' }));

    await waitFor(() => expect(onTransferred).toHaveBeenCalled());
    expect(transferStock).toHaveBeenCalledWith({
      productId: 'prod-1',
      fromLocation: 'loc-store',
      toLocation: 'loc-wh',
      quantity: 1,
    });
  });

  it('sends trimmed reason for single-product transfer', async () => {
    const onTransferred = vi.fn();
    render(<StockTransferModal product={sampleProduct} onClose={vi.fn()} onTransferred={onTransferred} />);

    await userEvent.type(screen.getByLabelText('4. 調撥原因'), '  門市補貨  ');
    await userEvent.click(screen.getByRole('button', { name: '調撥這個商品' }));

    await waitFor(() => expect(onTransferred).toHaveBeenCalled());
    expect(transferStock).toHaveBeenCalledWith({
      productId: 'prod-1',
      fromLocation: 'loc-store',
      toLocation: 'loc-wh',
      quantity: 1,
      reason: '門市補貨',
    });
  });

  it('sends trimmed reason for move-all transfer and omits whitespace-only reason', async () => {
    const onTransferred = vi.fn();
    const { rerender } = render(
      <StockTransferModal product={sampleProduct} onClose={vi.fn()} onTransferred={onTransferred} />
    );

    await userEvent.type(screen.getByLabelText('4. 調撥原因'), '  換櫃整理  ');
    await userEvent.click(screen.getByRole('button', { name: '移動來源地點全部非零數量' }));

    await waitFor(() =>
      expect(moveAllStock).toHaveBeenCalledWith({
        fromLocation: 'loc-store',
        toLocation: 'loc-wh',
        reason: '換櫃整理',
      })
    );

    moveAllStock.mockClear();
    rerender(
      <StockTransferModal
        product={{ ...sampleProduct, id: 'prod-2' }}
        onClose={vi.fn()}
        onTransferred={onTransferred}
      />
    );
    expect(screen.getByLabelText('4. 調撥原因')).toHaveValue('');

    await userEvent.type(screen.getByLabelText('4. 調撥原因'), '   ');
    await userEvent.click(screen.getByRole('button', { name: '移動來源地點全部非零數量' }));

    await waitFor(() =>
      expect(moveAllStock).toHaveBeenCalledWith({
        fromLocation: 'loc-store',
        toLocation: 'loc-wh',
      })
    );
  });
});
