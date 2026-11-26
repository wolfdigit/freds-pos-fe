import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { locationService, productService } from '@/services';
import { useSessionStore } from '@/store/sessionStore';
import type { InventoryLocationDto } from '@/types/inventory';
import type { Product } from '@/types/product';
import { CreateProductModal } from './CreateProductModal';

const LOCATIONS_WITH_OVERLAP: InventoryLocationDto[] = [
  {
    id: 'loc-store',
    name: '奇可門市現貨',
    displayOrder: 1,
    storeNames: ['奇可門市'],
    returnedStoreNames: [],
    preorderStoreNames: [],
    systemRole: null,
  },
  {
    id: 'loc-wh',
    name: '後方倉庫',
    displayOrder: 2,
    storeNames: [],
    returnedStoreNames: [],
    preorderStoreNames: [],
    systemRole: null,
  },
  {
    id: 'loc-company',
    name: '公司總倉',
    displayOrder: 3,
    storeNames: [],
    returnedStoreNames: [],
    preorderStoreNames: [],
    systemRole: 'company',
  },
  {
    id: 'loc-preorder',
    name: '預購保留',
    displayOrder: 6,
    storeNames: [],
    returnedStoreNames: [],
    preorderStoreNames: ['奇可門市'],
    systemRole: 'preorder',
  },
];

describe('CreateProductModal featured initial stock locations', () => {
  beforeEach(() => {
    useSessionStore.setState({ storeName: '奇可門市' });
    vi.spyOn(locationService, 'getLocations').mockResolvedValue(LOCATIONS_WITH_OVERLAP);
    vi.spyOn(productService, 'createProduct').mockResolvedValue({
      id: 'prod-1',
      sku: 'AA-100',
      normalizedSku: 'AA100',
      barcode: '4710000000001',
      brand: 'AutoArt',
      name: 'Skyline R34',
      listPrice: 630,
      inventories: [],
      totalInventory: 0,
      loginStoreQuantity: 0,
      loginStoreReturnedQuantity: 0,
    } as Product);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('lists store sale, merged preorder, and system company warehouse (omitting unrelated warehouse) and submits drafts by id', async () => {
    const onSuccess = vi.fn();
    render(<CreateProductModal open onClose={vi.fn()} onSuccess={onSuccess} />);

    await waitFor(() => expect(screen.getByText('奇可門市現貨')).toBeInTheDocument());
    expect(screen.getByText('預購保留')).toBeInTheDocument();
    expect(screen.getByText('公司總倉')).toBeInTheDocument();
    expect(screen.getByText('門市出貨')).toBeInTheDocument();
    expect(screen.getByText('門市預購保留・系統預購保留')).toBeInTheDocument();
    expect(screen.getByText('系統總倉')).toBeInTheDocument();
    expect(screen.queryByText(/後方倉庫/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/商品貨號/), { target: { value: 'AA-100' } });
    fireEvent.change(screen.getByLabelText(/國際條碼/), { target: { value: '4710000000001' } });
    fireEvent.change(screen.getByLabelText(/商品品名/), { target: { value: 'Skyline R34' } });
    fireEvent.change(screen.getByLabelText(/建議售價/), { target: { value: '630' } });

    fireEvent.change(screen.getByLabelText(/奇可門市現貨/), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText(/預購保留/), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText(/公司總倉/), { target: { value: '5' } });

    fireEvent.click(screen.getByRole('button', { name: '確認建檔' }));

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    expect(onSuccess.mock.calls[0][1]).toEqual({
      'loc-store': 3,
      'loc-preorder': 2,
      'loc-company': 5,
    });
  });

  it('shows 4 separate inputs when store preorder differs from system preorder', async () => {
    vi.spyOn(locationService, 'getLocations').mockResolvedValue([
      ...LOCATIONS_WITH_OVERLAP.map((l) => (l.id === 'loc-preorder' ? { ...l, preorderStoreNames: [] } : l)),
      {
        id: 'loc-store-pre',
        name: '奇可預購區',
        displayOrder: 7,
        storeNames: [],
        returnedStoreNames: [],
        preorderStoreNames: ['奇可門市'],
        systemRole: null,
      },
    ]);

    render(<CreateProductModal open onClose={vi.fn()} onSuccess={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('奇可預購區')).toBeInTheDocument());
    expect(screen.getByText('奇可門市現貨')).toBeInTheDocument();
    expect(screen.getByText('公司總倉')).toBeInTheDocument();
    expect(screen.getByText('預購保留')).toBeInTheDocument();
  });
});
