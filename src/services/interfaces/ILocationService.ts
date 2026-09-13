import type {
  StockLocationDto,
  CreateStockLocationRequest,
  UpdateStockLocationRequest,
  DeleteStockLocationRequest,
  DeleteStockLocationResponse,
} from '@/types/inventory';

export interface ILocationService {
  /** 取得所有在庫存地點主檔清單 */
  getLocations(): Promise<StockLocationDto[]>;

  /** 新增自訂庫存地點 (系統自動分配 UUID 作為 Primary Key) */
  createLocation(location: CreateStockLocationRequest): Promise<StockLocationDto>;

  /** 編輯庫存地點 (依據 UUID 更新) */
  updateLocation(id: string, data: UpdateStockLocationRequest): Promise<StockLocationDto>;

  /** 刪除庫存地點並將該地點所有商品現有庫存轉移至指定地點 */
  deleteLocation(id: string, request: DeleteStockLocationRequest): Promise<DeleteStockLocationResponse>;
}
