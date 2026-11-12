import { LOCATION_NAME_MAX_LENGTH } from '@/types/inventory';

export { LOCATION_NAME_MAX_LENGTH };

/** Empty, or longer than the backend limit, after trim. */
export function validateLocationName(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) return '請輸入地點名稱';
  if (trimmed.length > LOCATION_NAME_MAX_LENGTH) {
    return `據點名稱最多 ${LOCATION_NAME_MAX_LENGTH} 個字`;
  }
  return null;
}
