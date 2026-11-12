import type {
  InventoryLocationDto,
  CreateInventoryLocationRequest,
  UpdateInventoryLocationRequest,
  DeleteInventoryLocationRequest,
  DeleteInventoryLocationResponse,
} from '@/types/inventory';

export interface ILocationService {
  getLocations(): Promise<InventoryLocationDto[]>;
  createLocation(location: CreateInventoryLocationRequest): Promise<InventoryLocationDto>;
  updateLocation(id: string, data: UpdateInventoryLocationRequest): Promise<InventoryLocationDto>;
  /** 不搬數量。有門市綁定時要帶 rebindToLocation。 */
  deleteLocation(id: string, request: DeleteInventoryLocationRequest): Promise<DeleteInventoryLocationResponse>;
}
