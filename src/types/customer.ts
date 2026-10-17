export type VipTier =
  | 'S'
  | 'A'
  | 'B'
  | 'Retail';

export interface Customer {
  id: string;
  name: string; // Customer_Name
  phone: string; // Phone
  email: string | null; // Email
  vipTier: VipTier; // Tier
  vipTierName: string;
  totalSpent: number;
  note?: string; // 備註
  createdAt: string;
  createdBy?: string; // 建檔人員 (Auth)
  updatedAt: string;
  updatedBy?: string; // 更新人員 (Auth)
}

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  email?: string | null;
  vipTier?: VipTier;
  note?: string;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  email?: string | null;
  vipTier?: VipTier;
  note?: string;
}

export interface CustomerSearchParams {
  keyword?: string;
  vipTier?: VipTier | 'ALL';
  page?: number;
  pageSize?: number;
}

export interface CustomerSearchResponse {
  items: Customer[];
  page: number;
  pageSize: number;
  total: number;
}

export function getVipTierName(tier: VipTier): string {
  switch (tier) {
    case 'S':
      return 'S 級特約經銷';
    case 'A':
      return 'A 級批發經銷';
    case 'B':
      return 'B 級批發經銷';
    case 'Retail':
    default:
      return '零售客戶 (Retail)';
  }
}
