import type {
  InventoryLocationDto,
  CreateInventoryLocationRequest,
  UpdateInventoryLocationRequest,
  DeleteInventoryLocationRequest,
  DeleteInventoryLocationResponse,
} from '@/types/inventory';

export interface ILocationService {
  /** HTTP 版會短暫共用最近一次結果；fresh: true 會略過共用結果直接重新查詢。 */
  getLocations(options?: { fresh?: boolean }): Promise<InventoryLocationDto[]>;
  createLocation(location: CreateInventoryLocationRequest): Promise<InventoryLocationDto>;
  updateLocation(id: string, data: UpdateInventoryLocationRequest): Promise<InventoryLocationDto>;
  /** 不搬數量。有門市綁定時要帶 rebindToLocation。 */
  deleteLocation(id: string, request: DeleteInventoryLocationRequest): Promise<DeleteInventoryLocationResponse>;
}
