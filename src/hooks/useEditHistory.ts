import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { SectionEditHistory } from '@/lib/supabase/types/admin-cms';
import { toast } from 'sonner';

// 변경 이력 조회 (최근 30일)
export function useEditHistory(tableName?: string) {
  return useQuery({
    queryKey: ['edit-history', tableName],
    queryFn: async () => {
      let query = supabase
        .from('section_edit_history')
        .select('*')
        .gte('edited_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('edited_at', { ascending: false })
        .limit(100);

      if (tableName) {
        query = query.eq('table_name', tableName);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SectionEditHistory[];
    },
  });
}

// 테이블 이름을 한글로 변환
export function getTableDisplayName(tableName: string): string {
  const names: Record<string, string> = {
    'page_sections': '페이지 섹션',
    'hero_stats': '히어로 통계',
    'space_slides': '공간 슬라이드',
    'system_cards': '시스템 카드',
    'operating_hours': '운영시간',
  };
  return names[tableName] || tableName;
}

// 롤백 기능
export function useRollback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (history: SectionEditHistory) => {
      const { data: userData } = await supabase.auth.getUser();

      // 해당 테이블의 레코드 업데이트
      const { error } = await supabase
        .from(history.table_name)
        .update({
          [history.field_name!]: history.old_value,
          updated_at: new Date().toISOString()
        })
        .eq('id', history.record_id);

      if (error) throw error;

      // 롤백 이력 기록
      await supabase.from('section_edit_history').insert({
        table_name: history.table_name,
        record_id: history.record_id,
        field_name: history.field_name,
        old_value: history.new_value,
        new_value: history.old_value,
        edited_by: userData.user?.id
      });
    },
    onSuccess: () => {
      // 모든 관련 쿼리 무효화
      queryClient.invalidateQueries({ queryKey: ['page-sections'] });
      queryClient.invalidateQueries({ queryKey: ['page-sections-admin'] });
      queryClient.invalidateQueries({ queryKey: ['hero-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hero-stats-admin'] });
      queryClient.invalidateQueries({ queryKey: ['space-slides'] });
      queryClient.invalidateQueries({ queryKey: ['space-slides-admin'] });
      queryClient.invalidateQueries({ queryKey: ['system-cards'] });
      queryClient.invalidateQueries({ queryKey: ['system-cards-admin'] });
      queryClient.invalidateQueries({ queryKey: ['operating-hours'] });
      queryClient.invalidateQueries({ queryKey: ['operating-hours-admin'] });
      queryClient.invalidateQueries({ queryKey: ['edit-history'] });
      toast.success('이전 버전으로 복원되었습니다');
    },
    onError: (error: Error) => {
      toast.error('복원 실패: ' + error.message);
    }
  });
}
