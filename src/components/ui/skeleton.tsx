import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text' | 'card';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  ...props
}: SkeletonProps) {
  const variants = {
    default: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
    card: 'rounded-2xl',
  };

  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r',
        'from-muted/50 via-muted/80 to-muted/50',
        'bg-[length:200%_100%]',
        variants[variant],
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn('p-6 rounded-2xl border border-border', className)}>
      <Skeleton variant="circular" className="w-14 h-14 mb-4" />
      <Skeleton variant="text" className="h-6 w-3/4 mb-2" />
      <Skeleton variant="text" className="h-4 w-1/2 mb-4" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonImage({
  aspectRatio = '16/9',
  className
}: {
  aspectRatio?: string;
  className?: string;
}) {
  return (
    <Skeleton
      variant="card"
      className={cn('w-full', className)}
      style={{ aspectRatio }}
    />
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return (
    <Skeleton
      className={cn('h-10 w-24 rounded-lg', className)}
    />
  );
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  };

  return (
    <Skeleton
      variant="circular"
      className={sizes[size]}
    />
  );
}
