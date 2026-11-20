import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CartSummary } from './CartSummary';

function renderSummary(props: {
  originalTotal: number;
  salesOriginalTotal?: number;
  returnOriginalTotal?: number;
  priceAdjustment?: number;
  pointsDiscount?: number;
  shippingFee?: number;
  returnItemCount?: number;
  salesItemCount?: number;
  totalAmount?: number;
}) {
  const priceAdjustment = props.priceAdjustment ?? 0;
  const pointsDiscount = props.pointsDiscount ?? 0;
  const shippingFee = props.shippingFee ?? 0;
  const totalAmount =
    props.totalAmount ?? props.originalTotal + priceAdjustment - pointsDiscount + shippingFee;

  return render(
    <CartSummary
      shippingFee={shippingFee}
      onShippingFeeChange={vi.fn()}
      totalAmount={totalAmount}
      itemCount={2}
      salesItemCount={props.salesItemCount ?? 2}
      returnItemCount={props.returnItemCount ?? 0}
      onClear={vi.fn()}
      onCheckout={vi.fn()}
      originalTotal={props.originalTotal}
      salesOriginalTotal={props.salesOriginalTotal}
      returnOriginalTotal={props.returnOriginalTotal}
      priceAdjustment={priceAdjustment}
      pointsDiscount={pointsDiscount}
    />
  );
}

function rowValue(label: string): string | null | undefined {
  return screen.getByText(label).parentElement?.lastElementChild?.textContent;
}

function grandTotal(): string | null | undefined {
  const label = screen.queryByText('應收總計') ?? screen.getByText('門市退款總額');
  return label.parentElement?.parentElement?.querySelector('span.font-mono.text-3xl')?.textContent;
}

describe('CartSummary 商品原價 + 價格調整 + 點數折抵', () => {
  it('shows the original-price subtotal and an additive negative adjustment for a net markdown', () => {
    // 350→280、350→400：成交 680，原價 700，調整 -20
    renderSummary({ originalTotal: 700, priceAdjustment: -20 });
    expect(rowValue('商品原價')).toBe('NT$ 700');
    expect(rowValue('價格調整')).toBe('-NT$ 20');
    expect(grandTotal()).toBe('NT$ 680');
    expect(screen.queryByText(/折讓|商品小計|含價格調整/)).not.toBeInTheDocument();
  });

  it('shows a net markup as a positive adjustment, not -NT$ -80', () => {
    renderSummary({ originalTotal: 700, priceAdjustment: 80 });
    expect(rowValue('商品原價')).toBe('NT$ 700');
    expect(rowValue('價格調整')).toBe('+NT$ 80');
    expect(grandTotal()).toBe('NT$ 780');
  });

  it('hides the adjustment when nothing changed, so 商品原價 is the actual subtotal', () => {
    renderSummary({ originalTotal: 700 });
    expect(rowValue('商品原價')).toBe('NT$ 700');
    expect(screen.queryByText('價格調整')).not.toBeInTheDocument();
    expect(screen.queryByText('點數折抵')).not.toBeInTheDocument();
  });

  it('shows sales and returns at original price when the cart has returns', () => {
    // 銷售 350→280；退貨原價 500 改退 400（數量 -1，調整 +100）
    renderSummary({
      originalTotal: -150,
      salesOriginalTotal: 350,
      returnOriginalTotal: -500,
      priceAdjustment: 30,
      returnItemCount: 1,
      salesItemCount: 1,
    });
    expect(rowValue('待結銷售原價')).toBe('NT$ 350');
    expect(rowValue('↩️ 瑕疵退貨折抵（原價）')).toBe('NT$ -500');
    // 350 - 500 + 30 = -120
    expect(rowValue('價格調整')).toBe('+NT$ 30');
    expect(grandTotal()).toBe('NT$ -120');
  });

  it('keeps a points line out of 價格調整 and still adds up to 應收總計, including shipping', () => {
    // 原價 2000，改價 -50，點數折抵 410（含先改價再折 360，以及 80 元商品折到 0），運費 60
    // 成交 2000 - 50 - 410 + 60 = 1600
    renderSummary({
      originalTotal: 2000,
      priceAdjustment: -50,
      pointsDiscount: 410,
      shippingFee: 60,
    });
    expect(rowValue('商品原價')).toBe('NT$ 2,000');
    expect(rowValue('價格調整')).toBe('-NT$ 50');
    expect(rowValue('點數折抵')).toBe('-NT$ 410');
    expect(grandTotal()).toBe('NT$ 1,600');
    expect(screen.queryByText('-NT$ 460')).not.toBeInTheDocument();
  });

  it('shows a returned points line as +NT$ 360, not -NT$ -360', () => {
    renderSummary({
      originalTotal: -500,
      salesOriginalTotal: 0,
      returnOriginalTotal: -500,
      pointsDiscount: -360,
      returnItemCount: 1,
      salesItemCount: 0,
    });
    expect(rowValue('↩️ 瑕疵退貨折抵（原價）')).toBe('NT$ -500');
    expect(screen.queryByText('價格調整')).not.toBeInTheDocument();
    expect(rowValue('點數折抵')).toBe('+NT$ 360');
    expect(grandTotal()).toBe('NT$ -140');
  });
});
