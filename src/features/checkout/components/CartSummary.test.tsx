import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartSummary } from './CartSummary';

function renderSummary(priceAdjustment: number) {
  return render(
    <CartSummary
      subtotal={1000}
      priceAdjustment={priceAdjustment}
      shippingFee={0}
      onShippingFeeChange={vi.fn()}
      totalAmount={1000}
      itemCount={2}
      onClear={vi.fn()}
      onCheckout={vi.fn()}
    />
  );
}

describe('CartSummary price adjustment', () => {
  it('shows a net markdown as a negative 價格調整', () => {
    renderSummary(-70);
    expect(screen.getByText('含價格調整')).toBeInTheDocument();
    expect(screen.getByText('-NT$ 70')).toBeInTheDocument();
    expect(screen.queryByText(/折讓/)).not.toBeInTheDocument();
  });

  it('shows a net markup as a positive 價格調整', () => {
    renderSummary(50);
    expect(screen.getByText('+NT$ 50')).toBeInTheDocument();
  });

  it('hides the line when there is no adjustment', () => {
    renderSummary(0);
    expect(screen.queryByText('含價格調整')).not.toBeInTheDocument();
  });
});
