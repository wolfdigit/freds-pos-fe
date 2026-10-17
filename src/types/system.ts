export interface StoreDto {
  name: string;
  isDefault?: boolean;
}

export interface CreateStoreRequest {
  name: string;
}

export interface DeleteStoreResponse {
  success: boolean;
  deletedStore: string;
}
