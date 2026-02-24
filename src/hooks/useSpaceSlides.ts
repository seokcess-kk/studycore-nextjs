import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { SpaceSlide, SpaceSlideForm } from '@/lib/supabase/types/admin-cms';
import { toast } from 'sonner';

// 공개용: 활성 슬라이드만 조회
export function useSpaceSlides() {
  return useQuery({
    queryKey: ['space-slides'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('space_slides')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as SpaceSlide[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

// 관리자용: 모든 슬라이드 조회
export function useSpaceSlidesAdmin() {
  return useQuery({
    queryKey: ['space-slides-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('space_slides')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data as SpaceSlide[];
    },
  });
}

// 슬라이드 생성
export function useCreateSpaceSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slide: SpaceSlideForm & { sort_order: number }) => {
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('space_slides')
        .insert({
          ...slide,
          updated_by: userData.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-slides'] });
      queryClient.invalidateQueries({ queryKey: ['space-slides-admin'] });
      toast.success('슬라이드가 추가되었습니다');
    },
    onError: (error: Error) => {
      toast.error('추가 실패: ' + error.message);
    }
  });
}

// 슬라이드 수정
export function useUpdateSpaceSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SpaceSlide> & { id: string }) => {
      const { data: userData } = await supabase.auth.getUser();

      // 이력 기록용 현재 값 조회
      const { data: current } = await supabase
        .from('space_slides')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('space_slides')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
          updated_by: userData.user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // 변경 이력 기록
      if (current) {
        const changedFields = Object.keys(updates).filter(
          key => current[key as keyof SpaceSlide] !== updates[key as keyof typeof updates]
        );

        for (const field of changedFields) {
          await supabase.from('section_edit_history').insert({
            table_name: 'space_slides',
            record_id: id,
            field_name: field,
            old_value: String(current[field as keyof SpaceSlide] ?? ''),
            new_value: String(updates[field as keyof typeof updates] ?? ''),
            edited_by: userData.user?.id
          });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-slides'] });
      queryClient.invalidateQueries({ queryKey: ['space-slides-admin'] });
      queryClient.refetchQueries({ queryKey: ['space-slides'], type: 'active' });
      toast.success('저장 완료! 메인 페이지에 반영되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('저장 실패: ' + error.message);
    }
  });
}

// 슬라이드 삭제
export function useDeleteSpaceSlide() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('space_slides')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-slides'] });
      queryClient.invalidateQueries({ queryKey: ['space-slides-admin'] });
      toast.success('슬라이드가 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error('삭제 실패: ' + error.message);
    }
  });
}

// 순서 변경 (드래그 앤 드롭)
export function useReorderSpaceSlides() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      const updates = orderedIds.map((id, index) => ({
        id,
        sort_order: index + 1
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('space_slides')
          .update({ sort_order: update.sort_order })
          .eq('id', update.id);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['space-slides'] });
      queryClient.invalidateQueries({ queryKey: ['space-slides-admin'] });
      toast.success('순서가 변경되었습니다');
    },
    onError: (error: Error) => {
      toast.error('순서 변경 실패: ' + error.message);
    }
  });
}
