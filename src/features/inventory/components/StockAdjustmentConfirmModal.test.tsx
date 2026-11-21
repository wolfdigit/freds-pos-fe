import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const batchAdjustStock = vi.fn().mockResolvedValue(true);
vi.mock('@/services', () => ({ productService: { batchAdjustStock: (...args: unknown[]) => batchAdjustStock(...args) } }));

import { StockAdjustmentConfirmModal } from './StockAdjustmentConfirmModal';

const adjustment = {
  productId: 'prod-1', sku: 'SKU-1', name: '模型', brand: 'B', summaryText: '門市現貨 ➔ 退貨品 調撥 2 台',
  changes: [
    { location: 'a', locationName: '門市現貨', oldQty: 5, newQty: 3, diff: -2 },
    { location: 'b', locationName: '退貨品', oldQty: 0, newQty: 2, diff: 2 },
  ],
};

describe('StockAdjustmentConfirmModal 異動原因選填', () => {
  it('marks the reason optional and saves a transfer without one', async () => {
    const onSuccess = vi.fn();
    render(<StockAdjustmentConfirmModal open adjustments={[adjustment]} onClose={vi.fn()} onSuccess={onSuccess} />);
    expect(screen.getByText('異動原因 / 備註說明（選填）')).toBeInTheDocument();
    expect(screen.queryByText(/\*$/)).not.toBeInTheDocument();
    const save = screen.getByRole('button', { name: /確認存檔/ });
    expect(save).toBeEnabled();
    await userEvent.click(save);
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
    expect(batchAdjustStock).toHaveBeenCalledWith({ adjustments: [adjustment] });
  });

  it('sends a trimmed reason when one is filled', async () => {
    batchAdjustStock.mockClear();
    render(<StockAdjustmentConfirmModal open adjustments={[adjustment]} onClose={vi.fn()} onSuccess={vi.fn()} />);
    await userEvent.type(screen.getByPlaceholderText(/門市補貨進貨/), '  盤點  ');
    await userEvent.click(screen.getByRole('button', { name: /確認存檔/ }));
    await waitFor(() => expect(batchAdjustStock).toHaveBeenCalledWith({ adjustments: [adjustment], note: '盤點' }));
  });
});
