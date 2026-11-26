import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import { locationService, productService } from '@/services';
import { useSessionStore } from '@/store/sessionStore';
import type { InventoryLocationDto } from '@/types/inventory';
import type { Product } from '@/types/product';
import { ProductDetailModal } from './ProductDetailModal';

const SAMPLE_LOCATIONS: InventoryLocationDto[] = [
  {
    id: 'loc-store',
    name: '門市現貨',
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
    id: 'loc-returned',
    name: '退貨品',
    displayOrder: 5,
    storeNames: [],
    returnedStoreNames: ['奇可門市'],
    preorderStoreNames: [],
    systemRole: 'defective',
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

const SAMPLE_PRODUCT: Product = {
  id: 'prod-1',
  sku: 'AA-79122',
  normalizedSku: 'AA79122',
  barcode: '4710000000011',
  brand: 'AutoArt',
  name: 'Nissan GT-R R34',
  scale: '1:18',
  listPrice: 6800,
  inventories: [
    { location: 'loc-store', locationName: '門市現貨', quantity: 4 },
    { location: 'loc-wh', locationName: '後方倉庫', quantity: 7 },
    { location: 'loc-company', locationName: '公司總倉', quantity: 10 },
    { location: 'loc-returned', locationName: '退貨品', quantity: 1 },
    { location: 'loc-preorder', locationName: '預購保留', quantity: 2 },
  ],
  totalInventory: 24,
  loginStoreQuantity: 4,
  loginStoreReturnedQuantity: 1,
  loginStorePreorderQuantity: 2,
};

describe('ProductDetailModal inventory breakdown', () => {
  beforeEach(() => {
    useSessionStore.setState({ storeName: '奇可門市' });
    vi.spyOn(locationService, 'getLocations').mockResolvedValue(SAMPLE_LOCATIONS);
    vi.spyOn(productService, 'getProductsByBarcode').mockResolvedValue([SAMPLE_PRODUCT]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows merged store + system featured locations as cards and lists other locations in small chips', async () => {
    render(<ProductDetailModal open product={SAMPLE_PRODUCT} onClose={vi.fn()} />);

    await waitFor(() => expect(screen.getByText('門市預購保留・系統預購保留')).toBeInTheDocument());

    expect(screen.getByText('門市現貨')).toBeInTheDocument();
    expect(screen.getByText('門市可售')).toBeInTheDocument();
    expect(screen.getByText('退貨品')).toBeInTheDocument();
    expect(screen.getByText('門市退貨・系統退貨')).toBeInTheDocument();
    expect(screen.getByText('公司總倉')).toBeInTheDocument();
    expect(screen.getByText('系統總倉')).toBeInTheDocument();

    expect(screen.getByText('4 台')).toBeInTheDocument();
    expect(screen.getByText('2 台')).toBeInTheDocument();
    expect(screen.getByText('1 台')).toBeInTheDocument();
    expect(screen.getByText('10 台')).toBeInTheDocument();
    expect(screen.getByText('24 台')).toBeInTheDocument();

    // Non-featured location stays in small text chips; featured locations are not duplicated as chips
    expect(screen.getByText('後方倉庫 7')).toBeInTheDocument();
    expect(screen.queryByText('門市現貨 4')).not.toBeInTheDocument();
    expect(screen.queryByText('公司總倉 10')).not.toBeInTheDocument();
  });

  it('shows 讀取中 instead of the old 3-card layout while locations load', async () => {
    let resolve: (rows: InventoryLocationDto[]) => void = () => {};
    vi.mocked(locationService.getLocations).mockReturnValue(new Promise((r) => { resolve = r; }));
    render(<ProductDetailModal open product={SAMPLE_PRODUCT} onClose={vi.fn()} />);

    expect(screen.getByText('讀取中')).toBeInTheDocument();
    expect(screen.queryByText('門市退貨')).toBeNull();
    expect(screen.queryByText('門市預購保留')).toBeNull();

    await act(async () => resolve(SAMPLE_LOCATIONS));
    expect(await screen.findByText('門市預購保留・系統預購保留')).toBeInTheDocument();
    expect(screen.queryByText('讀取中')).toBeNull();
  });

  it('lets long location names truncate inside the card', async () => {
    const longName = '這是一個非常非常非常非常非常非常長的庫存地點名稱';
    vi.mocked(locationService.getLocations).mockResolvedValue(
      SAMPLE_LOCATIONS.map((row) => (row.id === 'loc-store' ? { ...row, name: longName } : row))
    );
    render(<ProductDetailModal open product={SAMPLE_PRODUCT} onClose={vi.fn()} />);
    const name = await screen.findByTitle(longName);
    expect(name).toHaveClass('min-w-0', 'max-w-full', 'truncate');
  });

  it('does not load locations while closed, and loads them once opened', async () => {
    const getLocations = vi.mocked(locationService.getLocations);
    const { rerender } = render(<ProductDetailModal open={false} product={null} onClose={vi.fn()} />);
    rerender(<ProductDetailModal open={false} product={SAMPLE_PRODUCT} onClose={vi.fn()} />);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(getLocations).not.toHaveBeenCalled();

    rerender(<ProductDetailModal open product={SAMPLE_PRODUCT} onClose={vi.fn()} />);
    await waitFor(() => expect(getLocations).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('門市預購保留・系統預購保留')).toBeInTheDocument();
  });
});
