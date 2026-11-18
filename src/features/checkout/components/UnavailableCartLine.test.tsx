import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UnavailableCartLine } from './UnavailableCartLine';

describe('UnavailableCartLine', () => {
  it('renders the row unchanged when the product is available', () => {
    render(
      <UnavailableCartLine reason={null} onRemove={vi.fn()}>
        <span>QA-商品</span>
      </UnavailableCartLine>
    );
    expect(screen.getByText('QA-商品')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('marks a missing product and offers a remove button', () => {
    const onRemove = vi.fn();
    render(
      <UnavailableCartLine reason="商品已不存在，請移除後再結帳" onRemove={onRemove}>
        <span>QA-付款測試</span>
      </UnavailableCartLine>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('商品已不存在');
    fireEvent.click(screen.getByRole('button', { name: '移除' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});
