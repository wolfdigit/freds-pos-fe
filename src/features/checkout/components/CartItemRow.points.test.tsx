import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { CartItem } from '@/store/cartStore';
import { CartItemRow } from './CartItemRow';

const base: CartItem = {
  productId: 'a',
  sku: 'SKU-A',
  name: '模型 A',
  brand: 'B',
  originalPrice: 500,
  unitPrice: 500,
  isManualPrice: false,
  quantity: 1,
};

function renderRow(item: CartItem, pointsDiscount: Parameters<typeof CartItemRow>[0]['pointsDiscount']) {
  return render(
    <CartItemRow
      item={item}
      index={1}
      onUpdateQuantity={vi.fn()}
      onUpdatePrice={vi.fn()}
      onRemove={vi.fn()}
      pointsDiscount={pointsDiscount}
    />
  );
}

describe('CartItemRow 點數折抵 $360', () => {
  it('is disabled with a hint when no member is attached', async () => {
    const onToggle = vi.fn();
    renderRow(base, { applied: false, disabledReason: '需綁定會員', onToggle });
    const box = screen.getByRole('checkbox', { name: /點數折抵 \$360/ });
    expect(box).toBeDisabled();
    expect(screen.getByText('（需綁定會員）')).toBeInTheDocument();
    await userEvent.click(box);
    expect(onToggle).not.toHaveBeenCalled();
    expect(box).not.toBeChecked();
  });

  it('is disabled on the plain line when the product is already redeemed', () => {
    renderRow({ ...base, quantity: 2 }, { applied: false, disabledReason: '此商品已折抵', onToggle: vi.fn() });
    expect(screen.getByRole('checkbox', { name: /點數折抵 \$360/ })).toBeDisabled();
  });

  it('toggles and locks price and quantity on the points line', () => {
    const onToggle = vi.fn();
    const { rerender } = renderRow(base, { applied: false, onToggle });
    fireEvent.click(screen.getByRole('checkbox', { name: /點數折抵 \$360/ }));
    expect(onToggle).toHaveBeenCalledWith(true);

    const redeemed: CartItem = { ...base, unitPrice: 140, pointsDiscountApplied: true, pointsBasePrice: 500 };
    rerender(
      <CartItemRow item={redeemed} index={1} onUpdateQuantity={vi.fn()} onUpdatePrice={vi.fn()} onRemove={vi.fn()}
        pointsDiscount={{ applied: true, onToggle }} />
    );
    expect(screen.getByRole('checkbox', { name: /點數折抵 \$360/ })).toBeChecked();
    expect(screen.getByText('點數折抵')).toBeInTheDocument();
    expect(screen.getByTitle('點數折抵列不能直接改價，請先取消勾選')).toHaveAttribute('readonly');
    expect(screen.getByTitle('點數折抵固定 1 件')).toBeDisabled();
    fireEvent.click(screen.getByRole('checkbox', { name: /點數折抵 \$360/ }));
    expect(onToggle).toHaveBeenLastCalledWith(false);
  });
});
