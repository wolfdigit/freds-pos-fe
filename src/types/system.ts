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
