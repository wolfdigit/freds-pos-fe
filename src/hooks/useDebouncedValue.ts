import { useEffect, useState } from 'react';

/** 搜尋框停止輸入 300ms 後才送查詢，避免每打一個字就打一次 API。 */
export const SEARCH_DEBOUNCE_MS = 300;

/**
 * 回傳延遲更新的值。清空輸入（空字串）時立即套用，讓「清除搜尋」不必等待。
 */
export function useDebouncedValue<T>(value: T, delayMs: number = SEARCH_DEBOUNCE_MS): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (typeof value === 'string' && value.trim() === '') {
      setDebounced(value);
      return;
    }
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
