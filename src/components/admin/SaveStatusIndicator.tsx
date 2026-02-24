import { Loader2, Circle, Check } from 'lucide-react';

interface SaveStatusIndicatorProps {
  hasChanges: boolean;
  isPending: boolean;
  lastSavedAt: Date | null;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 10) return '방금 전';
  if (diffSec < 60) return `${diffSec}초 전`;
  if (diffMin < 60) return `${diffMin}분 전`;
  if (diffHour < 24) return `${diffHour}시간 전`;

  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SaveStatusIndicator({
  hasChanges,
  isPending,
  lastSavedAt,
}: SaveStatusIndicatorProps) {
  if (isPending) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-amber-500">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        저장 중...
      </span>
    );
  }

  if (hasChanges) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-amber-500">
        <Circle className="w-2 h-2 fill-current" />
        저장되지 않은 변경사항
      </span>
    );
  }

  if (lastSavedAt) {
    return (
      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Check className="w-3.5 h-3.5 text-green-500" />
        마지막 저장: {formatRelativeTime(lastSavedAt)}
      </span>
    );
  }

  return null;
}
