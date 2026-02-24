import { cn } from '@/lib/utils';

interface CharacterCounterProps {
  current: number;
  max?: number;
  warn?: number; // 경고 시작 글자수 (기본: max의 80%)
}

export function CharacterCounter({ current, max, warn }: CharacterCounterProps) {
  const warningThreshold = warn ?? (max ? Math.floor(max * 0.8) : undefined);
  const isWarning = warningThreshold && current >= warningThreshold;
  const isOver = max && current > max;

  return (
    <span
      className={cn(
        'text-xs tabular-nums',
        isOver
          ? 'text-destructive font-medium'
          : isWarning
            ? 'text-amber-500'
            : 'text-muted-foreground'
      )}
    >
      {current}
      {max && `/${max}`}자
    </span>
  );
}
