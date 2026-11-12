import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiError } from '@/services/api/httpClient';
import { locationService } from '@/services';
import { useToastStore } from '@/components/feedback/toastStore';
import type { InventoryLocationDto } from '@/types/inventory';
import { validateLocationName } from '@/utils/locationName';
import { CreateLocationModal } from './CreateLocationModal';
import { EditLocationModal } from './EditLocationModal';

const location: InventoryLocationDto = {
  id: 'loc-1',
  name: '臨時倉',
  icon: '📦',
  storeNames: [],
  returnedStoreNames: [],
};

afterEach(() => {
  vi.restoreAllMocks();
  useToastStore.setState({ toasts: [] });
});

describe('location name limit', () => {
  it('rejects a 65-character name on create before calling the API', async () => {
    const user = userEvent.setup();
    const createLocation = vi.spyOn(locationService, 'createLocation');
    expect(validateLocationName(` ${'倉'.repeat(64)} `)).toBeNull();
    expect(validateLocationName('倉'.repeat(65))).toBe('據點名稱最多 64 個字');

    render(
      <CreateLocationModal open onClose={vi.fn()} onSuccess={vi.fn()} existingLocations={[]} />
    );

    const input = screen.getByLabelText(/據點名稱/);
    expect(input).toHaveAttribute('maxlength', '64');
    fireEvent.change(input, { target: { value: '倉'.repeat(65) } });
    await user.click(screen.getByRole('button', { name: '確認新增' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('據點名稱最多 64 個字');
    expect(createLocation).not.toHaveBeenCalled();
  });

  it('rejects a 65-character rename and shows a backend validation error', async () => {
    const user = userEvent.setup();
    const updateLocation = vi.spyOn(locationService, 'updateLocation').mockRejectedValue(
      new ApiError(
        'API 請求失敗 (400)：/inventory/locations/loc-1',
        400,
        'Bad Request',
        '/inventory/locations/loc-1',
        { errors: { Name: ['The field Name must be a string with a maximum length of 64.'] } },
        null
      )
    );

    const { rerender } = render(
      <EditLocationModal location={location} onClose={vi.fn()} onSuccess={vi.fn()} />
    );

    const input = screen.getByLabelText(/據點名稱/);
    expect(input).toHaveAttribute('maxlength', '64');
    fireEvent.change(input, { target: { value: '倉'.repeat(65) } });
    await user.click(screen.getByRole('button', { name: '儲存變更' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('據點名稱最多 64 個字');
    expect(updateLocation).not.toHaveBeenCalled();

    rerender(<EditLocationModal location={{ ...location }} onClose={vi.fn()} onSuccess={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/據點名稱/), { target: { value: '新倉庫' } });
    await user.click(screen.getByRole('button', { name: '儲存變更' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('maximum length of 64');
    expect(updateLocation).toHaveBeenCalledTimes(1);
  });
});
