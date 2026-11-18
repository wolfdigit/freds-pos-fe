import { Button } from './Button';

interface LoadMoreFooterProps {
  shown: number;
  total: number;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  /** 量詞，例如「項」。 */
  unit?: string;
}

/** 分頁清單底部：顯示已載入筆數，還有下一頁時提供「載入更多」。 */
export function LoadMoreFooter({ shown, total, hasMore, isLoadingMore, onLoadMore, unit = '項' }: LoadMoreFooterProps) {
  if (total === 0) return null;
  return (
    <div className="flex items-center justify-center gap-3 py-2 text-xs text-zinc-500" data-testid="load-more-footer">
      <span>
        已顯示 {Math.min(shown, total)} / 共 {total} {unit}
      </span>
      {hasMore && (
        <Button variant="secondary" size="sm" loading={isLoadingMore} onClick={onLoadMore}>
          載入更多
        </Button>
      )}
    </div>
  );
}
