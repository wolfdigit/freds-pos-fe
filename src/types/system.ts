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

export type OAuthRole = 'admin' | 'staff';

export interface OAuthAccountDto {
  email: string;
  role: OAuthRole;
  name?: string;
  note?: string;
  assignedStores?: string[]; // 授權可登入與操作的門市清單 (多對多；若為空代表全門市)
}

export interface CreateOAuthAccountRequest {
  email: string;
  role: OAuthRole;
  name?: string;
  note?: string;
  assignedStores?: string[];
}

export interface UpdateOAuthAccountRequest {
  role?: OAuthRole;
  name?: string;
  note?: string;
  assignedStores?: string[];
}
