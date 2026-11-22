import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

describe('CartItemRow 預購取貨', () => {
  it('shows the checkbox next to 點數折抵 and reports toggles', async () => {
    const onToggle = vi.fn();
    const { rerender } = render(
      <CartItemRow
        item={base}
        index={1}
        onUpdateQuantity={vi.fn()}
        onUpdatePrice={vi.fn()}
        onRemove={vi.fn()}
        pointsDiscount={{ applied: false, onToggle: vi.fn() }}
        preorderPickup={{ checked: false, onToggle }}
      />
    );
    const box = screen.getByRole('checkbox', { name: '預購取貨' });
    expect(box).not.toBeChecked();
    expect(screen.getByRole('checkbox', { name: /點數折抵 \$360/ })).toBeInTheDocument();
    await userEvent.click(box);
    expect(onToggle).toHaveBeenCalledWith(true);

    rerender(
      <CartItemRow
        item={{ ...base, preorderPickup: true }}
        index={1}
        onUpdateQuantity={vi.fn()}
        onUpdatePrice={vi.fn()}
        onRemove={vi.fn()}
        preorderPickup={{ checked: true, onToggle }}
      />
    );
    expect(screen.getByRole('checkbox', { name: '預購取貨' })).toBeChecked();
  });

  it('is not rendered when the prop is omitted', () => {
    render(<CartItemRow item={base} index={1} onUpdateQuantity={vi.fn()} onUpdatePrice={vi.fn()} onRemove={vi.fn()} />);
    expect(screen.queryByRole('checkbox', { name: '預購取貨' })).toBeNull();
  });
});
