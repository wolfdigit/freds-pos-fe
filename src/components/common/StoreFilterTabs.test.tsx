import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { StoreFilterTabs } from './StoreFilterTabs';

const tabs = [
  { key: 'store:奇可門市', label: '奇可門市' },
  { key: 'all', label: '所有門市總計' },
];

describe('StoreFilterTabs', () => {
  it('keeps the default (inventory) size and marks the active tab', () => {
    const onSelect = vi.fn();
    render(<StoreFilterTabs tabs={tabs} activeKey="all" onSelect={onSelect} />);
    const button = screen.getByRole('button', { name: '奇可門市' });
    expect(button.className).toContain('px-3.5 py-1.5 text-sm');
    expect(button.className).not.toContain('min-h-10');
    expect(screen.getByRole('button', { name: '所有門市總計' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(button);
    expect(onSelect).toHaveBeenCalledWith('store:奇可門市');
  });

  it('uses larger, 40px-high tap targets for size lg (daily report)', () => {
    render(<StoreFilterTabs tabs={tabs} activeKey="all" onSelect={vi.fn()} size="lg" />);
    const button = screen.getByRole('button', { name: '奇可門市' });
    expect(button.className).toContain('min-h-10');
    expect(button.className).toContain('text-base');
  });
});
