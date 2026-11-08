export interface StoreDto {
  name: string;
  isDefault?: boolean;
  stockLocationId?: string | null;
  stockLocationName?: string | null;
}

export interface CreateStoreRequest {
  name: string;
  /** Omit to let the server bind the existing shared shelf, if that shelf still exists. */
  stockLocationId?: string;
}

export interface UpdateStoreStockLocationRequest {
  stockLocationId: string;
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
