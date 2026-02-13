import { useState } from 'react';
import { useEditHistory, getTableDisplayName, useRollback } from '@/hooks/useEditHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RotateCcw, History, ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { SectionEditHistory } from '@/lib/supabase/types/admin-cms';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';

export function EditHistoryView() {
  const [tableFilter, setTableFilter] = useState<string>('all');
  const { data: history, isLoading } = useEditHistory(
    tableFilter === 'all' ? undefined : tableFilter
  );
  const rollback = useRollback();
  const [rollbackTarget, setRollbackTarget] = useState<SectionEditHistory | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // 날짜별 그룹화
  const groupedHistory: Record<string, SectionEditHistory[]> = {};
  history?.forEach(item => {
    const date = format(parseISO(item.edited_at), 'yyyy-MM-dd');
    if (!groupedHistory[date]) {
      groupedHistory[date] = [];
    }
    groupedHistory[date].push(item);
  });

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return '오늘';
    if (isYesterday(date)) return '어제';
    return format(date, 'yyyy년 M월 d일', { locale: ko });
  };

  const truncateValue = (value: string | null, maxLength = 30) => {
    if (!value) return '(없음)';
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-5 h-5 text-primary" />
            <CardTitle>변경 이력</CardTitle>
          </div>
          <Select value={tableFilter} onValueChange={setTableFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="전체 섹션" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 섹션</SelectItem>
              <SelectItem value="page_sections">페이지 섹션</SelectItem>
              <SelectItem value="hero_stats">히어로 통계</SelectItem>
              <SelectItem value="space_slides">공간 슬라이드</SelectItem>
              <SelectItem value="system_cards">시스템 카드</SelectItem>
              <SelectItem value="operating_hours">운영시간</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {Object.keys(groupedHistory).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              변경 이력이 없습니다
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedHistory).map(([date, items]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    {getDateLabel(date)}
                  </h3>
                  <div className="space-y-2">
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">
                              {format(parseISO(item.edited_at), 'HH:mm')}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                              {getTableDisplayName(item.table_name)}
                            </span>
                            {item.field_name && (
                              <span className="text-xs text-muted-foreground">
                                {item.field_name}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground truncate max-w-[200px]">
                              {truncateValue(item.old_value)}
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <span className="truncate max-w-[200px]">
                              {truncateValue(item.new_value)}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRollbackTarget(item)}
                          className="flex-shrink-0"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          되돌리기
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 롤백 확인 */}
      <AlertDialog open={!!rollbackTarget} onOpenChange={() => setRollbackTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>변경사항 되돌리기</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium">{rollbackTarget?.field_name}</span> 필드를{' '}
              <span className="font-medium">"{truncateValue(rollbackTarget?.old_value ?? null, 50)}"</span>
              (으)로 되돌리시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (rollbackTarget) {
                  rollback.mutate(rollbackTarget);
                  setRollbackTarget(null);
                }
              }}
              disabled={rollback.isPending}
            >
              {rollback.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              되돌리기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
