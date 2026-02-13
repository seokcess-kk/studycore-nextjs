import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { HeroStat, HeroStatForm } from '@/lib/supabase/types/admin-cms';
import { toast } from 'sonner';

// 공개용: 활성 통계만 조회
export function useHeroStats() {
  return useQuery({
    queryKey: ['hero-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_stats')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as HeroStat[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 관리자용: 모든 통계 조회
export function useHeroStatsAdmin() {
  return useQuery({
    queryKey: ['hero-stats-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('hero_stats')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data as HeroStat[];
    },
  });
}

// 통계 생성
export function useCreateHeroStat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (stat: HeroStatForm & { sort_order: number }) => {
      const { data, error } = await supabase
        .from('hero_stats')
        .insert(stat)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hero-stats-admin'] });
      toast.success('통계가 추가되었습니다');
    },
    onError: (error: Error) => {
      toast.error('추가 실패: ' + error.message);
    }
  });
}

// 통계 수정
export function useUpdateHeroStat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HeroStat> & { id: string }) => {
      const { data: userData } = await supabase.auth.getUser();

      // 이력 기록용 현재 값 조회
      const { data: current } = await supabase
        .from('hero_stats')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('hero_stats')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 변경 이력 기록
      if (current) {
        const changedFields = Object.keys(updates).filter(
          key => current[key as keyof HeroStat] !== updates[key as keyof typeof updates]
        );

        for (const field of changedFields) {
          await supabase.from('section_edit_history').insert({
            table_name: 'hero_stats',
            record_id: id,
            field_name: field,
            old_value: String(current[field as keyof HeroStat] ?? ''),
            new_value: String(updates[field as keyof typeof updates] ?? ''),
            edited_by: userData.user?.id
          });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hero-stats-admin'] });
      toast.success('저장되었습니다');
    },
    onError: (error: Error) => {
      toast.error('저장 실패: ' + error.message);
    }
  });
}

// 통계 삭제
export function useDeleteHeroStat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hero_stats')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hero-stats-admin'] });
      toast.success('통계가 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error('삭제 실패: ' + error.message);
    }
  });
}

// 순서 변경
export function useReorderHeroStats() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from('hero_stats')
          .update({ sort_order: i + 1 })
          .eq('id', orderedIds[i]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero-stats'] });
      queryClient.invalidateQueries({ queryKey: ['hero-stats-admin'] });
      toast.success('순서가 변경되었습니다');
    },
    onError: (error: Error) => {
      toast.error('순서 변경 실패: ' + error.message);
    }
  });
}
