export interface StoreDto {
  name: string;
  isDefault?: boolean;
  inventoryLocationId: string;
  inventoryLocationName: string;
  returnedInventoryLocationId: string;
  returnedInventoryLocationName: string;
  /** 預購保留：會員來門市取預購時，預購取貨的列從這裡扣。 */
  preorderInventoryLocationId: string;
  preorderInventoryLocationName: string;
}

export interface CreateStoreRequest {
  name: string;
  inventoryLocationId: string;
  returnedInventoryLocationId: string;
  /** 省略時後端用系統地點「預購保留」。 */
  preorderInventoryLocationId?: string;
}

export interface UpdateStoreBindingRequest {
  inventoryLocationId: string;
  returnedInventoryLocationId: string;
  /** 省略時維持原本的預購保留綁定。 */
  preorderInventoryLocationId?: string;
}

export interface DeleteStoreResponse {
  success: boolean;
  deletedStore: string;
}

export interface OAuthAccountDto {
  id: string;
  email: string;
  role: string;
  name?: string | null;
  note?: string | null;
}

export interface CreateOAuthAccountRequest {
  email: string;
  role: string;
  name: string;
  note?: string | null;
}

export interface UpdateOAuthAccountRequest {
  role?: string;
  name?: string | null;
  note?: string | null;
}
