/**
 * Skeleton UI 컴포넌트
 * PDCA: ui-ux-improvements Phase 2 - UX Enhancement
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200",
        className
      )}
      aria-hidden="true"
    />
  );
}

interface SkeletonCardProps {
  className?: string;
  showImage?: boolean;
  lines?: number;
}

export function SkeletonCard({
  className,
  showImage = true,
  lines = 3,
}: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-6 shadow-sm border border-slate-100",
        className
      )}
      role="status"
      aria-label="콘텐츠 로딩 중"
    >
      {showImage && (
        <Skeleton className="w-full h-48 rounded-xl mb-4" />
      )}
      <div className="space-y-3">
        <Skeleton className="h-6 w-3/4" />
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn(
              "h-4",
              i === lines - 1 ? "w-1/2" : "w-full"
            )}
          />
        ))}
      </div>
    </div>
  );
}

interface NoticeSkeletonProps {
  count?: number;
}

export function NoticeSkeleton({ count = 5 }: NoticeSkeletonProps) {
  return (
    <div className="space-y-4" role="status" aria-label="공지사항 로딩 중">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">공지사항을 불러오는 중입니다...</span>
    </div>
  );
}

interface GridSkeletonProps {
  count?: number;
  columns?: 2 | 3 | 4;
}

export function GridSkeleton({ count = 6, columns = 3 }: GridSkeletonProps) {
  const gridCols = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn("grid gap-6", gridCols[columns])}
      role="status"
      aria-label="콘텐츠 로딩 중"
    >
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
      <span className="sr-only">콘텐츠를 불러오는 중입니다...</span>
    </div>
  );
}
