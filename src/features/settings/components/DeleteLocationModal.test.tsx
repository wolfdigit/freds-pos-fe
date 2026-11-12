import { act } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/services/api/httpClient';
import { locationService, productService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import type { InventoryLocationDto } from '@/types/inventory';
import { DeleteLocationModal } from './DeleteLocationModal';

const stale: InventoryLocationDto = {
  id: 'loc-new',
  name: '臨時倉',
  icon: '📦',
  storeNames: [],
  returnedStoreNames: [],
};

const other: InventoryLocationDto = {
  id: 'loc-keep',
  name: '門市現貨',
  icon: '🏪',
  storeNames: [],
  returnedStoreNames: [],
};

const directDeleteCopy = '沒有門市綁這個地點，也沒有剩餘數量，可以直接刪除。';

afterEach(() => {
  vi.restoreAllMocks();
  useToastStore.setState({ toasts: [] });
});

describe('delete location confirmation', () => {
  it('shows the bound-store block after refetching a stale location', async () => {
    let resolveLocations: (rows: InventoryLocationDto[]) => void = () => undefined;
    const pending = new Promise<InventoryLocationDto[]>((resolve) => {
      resolveLocations = resolve;
    });
    vi.spyOn(locationService, 'getLocations').mockReturnValue(pending);
    vi.spyOn(productService, 'searchProducts').mockResolvedValue([]);
    const deleteLocation = vi.spyOn(locationService, 'deleteLocation').mockResolvedValue({
      deletedLocation: stale.id,
      reboundStoreNames: [],
    });

    render(
      <DeleteLocationModal location={stale} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: '確認刪除' })).toBeDisabled();
    expect(screen.queryByText(directDeleteCopy)).not.toBeInTheDocument();

    await act(async () => {
      resolveLocations([{ ...stale, storeNames: ['奇可門市'], returnedStoreNames: [] }, other]);
    });

    expect(await screen.findByText(/正常商品門市：奇可門市/)).toBeInTheDocument();
    expect(screen.queryByText(directDeleteCopy)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '確認刪除' })).toBeEnabled();

    await userEvent.setup().click(screen.getByRole('button', { name: '確認刪除' }));
    await waitFor(() => expect(deleteLocation).toHaveBeenCalledTimes(1));
    expect(deleteLocation).toHaveBeenCalledWith(stale.id, { rebindToLocation: other.id });
  });

  it('refetches again before delete and blocks a binding that appeared after open', async () => {
    const user = userEvent.setup();
    const bound = { ...stale, storeNames: ['奇可門市'], returnedStoreNames: [] as string[] };
    let calls = 0;
    vi.spyOn(locationService, 'getLocations').mockImplementation(async () => {
      calls += 1;
      return calls === 1 ? [stale, other] : [bound, other];
    });
    vi.spyOn(productService, 'searchProducts').mockResolvedValue([]);
    const deleteLocation = vi.spyOn(locationService, 'deleteLocation');

    render(<DeleteLocationModal location={stale} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(await screen.findByText(directDeleteCopy)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: '確認刪除' }));

    expect(await screen.findByText(/正常商品門市：奇可門市/)).toBeInTheDocument();
    expect(screen.queryByText(directDeleteCopy)).not.toBeInTheDocument();
    expect(deleteLocation).not.toHaveBeenCalled();
  });

  it('disables confirm when the refetched location still has quantity', async () => {
    vi.spyOn(locationService, 'getLocations').mockResolvedValue([stale, other]);
    vi.spyOn(productService, 'searchProducts').mockResolvedValue([
      {
        id: 'prod-1',
        sku: 'SKU',
        normalizedSku: 'SKU',
        barcode: '',
        brand: '',
        name: '車',
        listPrice: 1,
        inventories: [{ location: stale.id, locationName: stale.name, quantity: -2 }],
        totalInventory: -2,
        loginStoreQuantity: null,
        loginStoreReturnedQuantity: null,
      },
    ]);
    const deleteLocation = vi.spyOn(locationService, 'deleteLocation');

    render(<DeleteLocationModal location={stale} onClose={vi.fn()} onSuccess={vi.fn()} />);

    expect(await screen.findByText(/這個地點還有數量/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '確認刪除' })).toBeDisabled();
    expect(deleteLocation).not.toHaveBeenCalled();
  });

  it('shows the backend 400 message and refreshes after delete is refused', async () => {
    const user = userEvent.setup();
    const refresh = vi.fn();
    vi.spyOn(locationService, 'getLocations').mockResolvedValue([stale, other]);
    vi.spyOn(productService, 'searchProducts').mockResolvedValue([]);
    vi.spyOn(locationService, 'deleteLocation').mockRejectedValue(
      new ApiError(
        'API 請求失敗 (400)：/inventory/locations/loc-new',
        400,
        'Bad Request',
        '/inventory/locations/loc-new',
        { code: 'INVENTORY_LOCATION_IN_USE', message: '門市仍綁定此庫存點' },
        'INVENTORY_LOCATION_IN_USE'
      )
    );

    render(
      <DeleteLocationModal location={stale} onClose={vi.fn()} onSuccess={vi.fn()} onRefresh={refresh} />
    );

    const confirm = await screen.findByRole('button', { name: '確認刪除' });
    await waitFor(() => expect(confirm).toBeEnabled());
    const refreshesAfterOpen = refresh.mock.calls.length;
    await user.click(confirm);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('門市仍綁定此庫存點');
    expect(alert).toHaveTextContent('INVENTORY_LOCATION_IN_USE');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await waitFor(() => expect(refresh.mock.calls.length).toBeGreaterThan(refreshesAfterOpen));
    expect(
      useToastStore.getState().toasts.some((toast) => toast.variant === 'error' && toast.message.includes('門市仍綁定此庫存點'))
    ).toBe(true);
  });
});
