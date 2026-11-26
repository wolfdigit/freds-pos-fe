import { LEGACY_LOCATION_IDS, type InventoryLocationDto, type SystemLocationRole } from '@/types/inventory';

export type FeaturedLocationRole =
  | 'storeSale'
  | 'storePreorder'
  | 'storeReturned'
  | 'systemCompany'
  | 'systemPreorder'
  | 'systemReturned';

export interface FeaturedLocationEntry {
  location: InventoryLocationDto;
  roles: FeaturedLocationRole[];
}

export const CREATE_PRODUCT_LOCATION_ROLES: readonly FeaturedLocationRole[] = [
  'storeSale',
  'storePreorder',
  'systemCompany',
  'systemPreorder',
];

export const PRODUCT_DETAIL_LOCATION_ROLES: readonly FeaturedLocationRole[] = [
  'storeSale',
  'storePreorder',
  'storeReturned',
  'systemCompany',
  'systemPreorder',
  'systemReturned',
];

const SYSTEM_ROLE_FALLBACK_ID: Record<SystemLocationRole, string> = {
  company: LEGACY_LOCATION_IDS.company,
  preorder: LEGACY_LOCATION_IDS.preorder,
  defective: LEGACY_LOCATION_IDS.returned,
};

function findSystemLocation(
  locations: InventoryLocationDto[],
  role: SystemLocationRole
): InventoryLocationDto | undefined {
  return (
    locations.find((loc) => loc.systemRole === role) ??
    locations.find((loc) => loc.id === SYSTEM_ROLE_FALLBACK_ID[role])
  );
}

function findLocationForRole(
  locations: InventoryLocationDto[],
  storeName: string,
  role: FeaturedLocationRole
): InventoryLocationDto | undefined {
  const normalizedStore = storeName.trim();
  switch (role) {
    case 'storeSale':
      return normalizedStore ? locations.find((loc) => loc.storeNames.includes(normalizedStore)) : undefined;
    case 'storePreorder':
      return normalizedStore
        ? locations.find((loc) => (loc.preorderStoreNames ?? []).includes(normalizedStore))
        : undefined;
    case 'storeReturned':
      return normalizedStore
        ? locations.find((loc) => loc.returnedStoreNames.includes(normalizedStore))
        : undefined;
    case 'systemCompany':
      return findSystemLocation(locations, 'company');
    case 'systemPreorder':
      return findSystemLocation(locations, 'preorder');
    case 'systemReturned':
      return findSystemLocation(locations, 'defective');
  }
}

/**
 * 依指定角色順序解析要列出的庫存地點；若不同角色指向同一個庫存點（例如門市綁定與系統預設重疊），
 * 合併成同一筆並保留最先出現的位置與所有角色。
 */
export function resolveFeaturedLocations(
  locations: InventoryLocationDto[],
  storeName: string,
  requestedRoles: readonly FeaturedLocationRole[]
): FeaturedLocationEntry[] {
  const entries: FeaturedLocationEntry[] = [];
  const byId = new Map<string, FeaturedLocationEntry>();

  for (const role of requestedRoles) {
    const location = findLocationForRole(locations, storeName, role);
    if (!location) continue;
    const existing = byId.get(location.id);
    if (existing) {
      if (!existing.roles.includes(role)) {
        existing.roles.push(role);
      }
    } else {
      const entry: FeaturedLocationEntry = { location, roles: [role] };
      byId.set(location.id, entry);
      entries.push(entry);
    }
  }

  return entries;
}

export function formatFeaturedLocationRoles(
  roles: readonly FeaturedLocationRole[],
  labels: Record<FeaturedLocationRole, string>
): string {
  return roles.map((role) => labels[role]).join('・');
}
