import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartSummary } from './CartSummary';

function renderSummary(props: {
  subtotal: number;
  salesPriceAdjustment?: number;
  returnPriceAdjustment?: number;
  salesSubtotal?: number;
  returnSubtotal?: number;
}) {
  return render(
    <CartSummary
      shippingFee={0}
      onShippingFeeChange={vi.fn()}
      totalAmount={props.subtotal}
      itemCount={2}
      onClear={vi.fn()}
      onCheckout={vi.fn()}
      {...props}
    />
  );
}

function rowValue(label: string): string | null | undefined {
  return screen.getByText(label).parentElement?.lastElementChild?.textContent;
}

describe('CartSummary 商品原價 + 價格調整', () => {
  it('shows the original-price subtotal and an additive negative adjustment for a net markdown', () => {
    // 350→280、350→400：成交 680，原價 700，調整 -20
    renderSummary({ subtotal: 680, salesPriceAdjustment: -20 });
    expect(rowValue('商品原價')).toBe('NT$ 700');
    expect(rowValue('價格調整')).toBe('-NT$ 20');
    expect(screen.queryByText(/折讓|商品小計|含價格調整/)).not.toBeInTheDocument();
  });

  it('shows a net markup as a positive adjustment', () => {
    renderSummary({ subtotal: 780, salesPriceAdjustment: 80 });
    expect(rowValue('商品原價')).toBe('NT$ 700');
    expect(rowValue('價格調整')).toBe('+NT$ 80');
  });

  it('hides the adjustment when nothing changed, so 商品原價 is the actual subtotal', () => {
    renderSummary({ subtotal: 700 });
    expect(rowValue('商品原價')).toBe('NT$ 700');
    expect(screen.queryByText('價格調整')).not.toBeInTheDocument();
  });

  it('shows sales and returns at original price when the cart has returns', () => {
    // 銷售 350→280；退貨原價 500 改退 400（數量 -1，調整 +100）
    renderSummary({
      subtotal: -120,
      salesSubtotal: 280,
      returnSubtotal: -400,
      salesPriceAdjustment: -70,
      returnPriceAdjustment: 100,
    });
    expect(rowValue('待結銷售原價')).toBe('NT$ 350');
    expect(rowValue('↩️ 瑕疵退貨折抵（原價）')).toBe('NT$ -500');
    // 350 - 500 + 30 = -120
    expect(rowValue('價格調整')).toBe('+NT$ 30');
  });
});
