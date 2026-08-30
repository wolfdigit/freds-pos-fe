export type VipTier = 'regular' | 'silver' | 'gold' | 'platinum';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  vipTier: VipTier;
  vipTierName: string;
  rewardPoints: number;
  totalSpent: number;
  note?: string;
  createdAt: string;
}export function getVipTierName(tier: VipTier): string {
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
