import { useCallback, useRef } from 'react';

/**
 * 只讓最後一次送出的請求更新畫面。
 * begin() 取得一個序號，isLatest(id) 判斷回應是否仍是最新的，舊回應直接丟棄。
 */
export function useLatestRequest() {
  const latest = useRef(0);
  const begin = useCallback(() => {
    latest.current += 1;
    return latest.current;
  }, []);
  const isLatest = useCallback((id: number) => id === latest.current, []);
  return { begin, isLatest };
}
