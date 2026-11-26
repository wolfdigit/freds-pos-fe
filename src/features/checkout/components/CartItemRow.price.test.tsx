import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type { CartItem } from '@/store/cartStore';
import { CartItemRow } from './CartItemRow';

const base: CartItem = {
  productId: 'p1',
  sku: '18-56801CL16',
  name: 'Ferrari SF-25 CL16',
  brand: 'Burago',
  originalPrice: 350,
  unitPrice: 350,
  isManualPrice: false,
  quantity: 1,
};

describe('CartItemRow 原價與價格調整位置', () => {
  it('shows original price above and price adjustment below the unit price input when modified', () => {
    render(
      <CartItemRow
        item={{ ...base, unitPrice: 351, isManualPrice: true }}
        index={1}
        onUpdateQuantity={vi.fn()}
        onUpdatePrice={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const priceCell = screen.getByTestId('unit-price-cell');
    expect(within(priceCell).getByText('原價 NT$ 350')).toBeInTheDocument();
    expect(within(priceCell).getByDisplayValue('351')).toBeInTheDocument();
    expect(within(priceCell).getByText('價格調整 +NT$ 1')).toBeInTheDocument();
  });

  it('hides original price and price adjustment when unit price equals original price', () => {
    render(
      <CartItemRow
        item={base}
        index={1}
        onUpdateQuantity={vi.fn()}
        onUpdatePrice={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const priceCell = screen.getByTestId('unit-price-cell');
    expect(within(priceCell).queryByText(/原價/)).not.toBeInTheDocument();
    expect(within(priceCell).queryByText(/價格調整/)).not.toBeInTheDocument();
  });

  it('shows only original price in the unit price cell for a points-discounted line', () => {
    render(
      <CartItemRow
        item={{ ...base, unitPrice: 0, pointsDiscountApplied: true, pointsBasePrice: 350 }}
        index={1}
        onUpdateQuantity={vi.fn()}
        onUpdatePrice={vi.fn()}
        onRemove={vi.fn()}
      />
    );

    const priceCell = screen.getByTestId('unit-price-cell');
    expect(within(priceCell).getByText('原價 NT$ 350')).toBeInTheDocument();
    expect(within(priceCell).queryByText(/價格調整/)).not.toBeInTheDocument();
  });
});
