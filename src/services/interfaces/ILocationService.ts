import type {
  InventoryLocationDto,
  CreateInventoryLocationRequest,
  UpdateInventoryLocationRequest,
  DeleteInventoryLocationRequest,
  DeleteInventoryLocationResponse,
  LocationStockSummary,
} from '@/types/inventory';

export interface ILocationService {
  /** HTTP 版會短暫共用最近一次結果；fresh: true 會略過共用結果直接重新查詢。 */
  getLocations(options?: { fresh?: boolean }): Promise<InventoryLocationDto[]>;
  /** 各庫存點的庫存合計，不必抓全部商品。 */
  getStockSummary(): Promise<LocationStockSummary[]>;
  createLocation(location: CreateInventoryLocationRequest): Promise<InventoryLocationDto>;
  updateLocation(id: string, data: UpdateInventoryLocationRequest): Promise<InventoryLocationDto>;
  /** 不搬數量。有門市綁定時要帶 rebindToLocation。 */
  deleteLocation(id: string, request: DeleteInventoryLocationRequest): Promise<DeleteInventoryLocationResponse>;
}
