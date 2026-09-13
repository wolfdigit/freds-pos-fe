export type VipTier = 'regular' | 'silver' | 'gold' | 'platinum';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  vipTier: VipTier;
  vipTierName: string;
  totalSpent: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
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
    case 'platinum':
      return '白金黑卡 (9折)';
    case 'gold':
      return '金卡會員 (95折)';
    case 'silver':
      return '銀卡會員 (98折)';
    case 'regular':
    default:
      return '一般會員';
  }
}
