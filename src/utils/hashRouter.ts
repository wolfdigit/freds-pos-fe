import type { ActiveTab } from '@/store/uiStore';

export interface RouteState {
  activeTab: ActiveTab | null;
  selectedCustomerId: string | null;
}

/**
 * 根據 activeTab 與 selectedCustomerId 產生標準 URL Hash
 */
export function getHashFromState(
  activeTab: ActiveTab | null,
  selectedCustomerId?: string | null
): string {
  if (!activeTab) {
    return '#/';
  }
  if (activeTab === 'customers') {
    if (selectedCustomerId) {
      return `#/customers/${encodeURIComponent(selectedCustomerId)}`;
    }
    return '#/customers';
  }
  return `#/${activeTab}`;
}

/**
 * 解析 URL Hash 並傳回對應的 activeTab 與 selectedCustomerId
 */
export function getStateFromHash(hash: string): RouteState {
  const raw = hash.replace(/^#\/?/, '').trim();
  if (!raw || raw === '/') {
    return { activeTab: null, selectedCustomerId: null };
  }

  // 例如 checkout 或 checkout?xxx
  if (raw.startsWith('checkout')) {
    return { activeTab: 'checkout', selectedCustomerId: null };
  }

  // 例如 inventory
  if (raw.startsWith('inventory')) {
    return { activeTab: 'inventory', selectedCustomerId: null };
  }

  // 例如 customers 或 customers/c1 或 customers?id=c1
  if (raw.startsWith('customers')) {
    let customerId: string | null = null;
    const parts = raw.split('/');
    if (parts.length > 1 && parts[1]) {
      customerId = decodeURIComponent(parts[1].split('?')[0]);
    } else if (raw.includes('?')) {
      const queryString = raw.split('?')[1];
      const params = new URLSearchParams(queryString);
      customerId = params.get('id');
    }
    return { activeTab: 'customers', selectedCustomerId: customerId || null };
  }

  return { activeTab: null, selectedCustomerId: null };
}
