import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { PageSection } from '@/lib/supabase/types/admin-cms';
import { toast } from 'sonner';

// 섹션별 데이터 조회 (공개용)
export function usePageSection(sectionKey: string) {
  return useQuery({
    queryKey: ['page-sections', sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('section_key', sectionKey)
        .order('field_order');

      if (error) throw error;

      // Record 형태로 변환 { field_key: content }
      return (data as PageSection[]).reduce((acc, item) => {
        acc[item.field_key] = item.content;
        return acc;
      }, {} as Record<string, string>);
    },
    staleTime: 1000 * 60 * 5, // 5분 캐시
  });
}

// 관리자용: 필드 메타데이터 포함 조회
export function usePageSectionAdmin(sectionKey: string) {
  return useQuery({
    queryKey: ['page-sections-admin', sectionKey],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('page_sections')
        .select('*')
        .eq('section_key', sectionKey)
        .order('field_order');

      if (error) throw error;
      return data as PageSection[];
    },
  });
}

// 필드 업데이트
export function useUpdatePageSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionKey,
      fieldKey,
      content
    }: {
      sectionKey: string;
      fieldKey: string;
      content: string;
    }) => {
      // 1. 현재 값 조회 (이력용)
      const { data: current } = await supabase
        .from('page_sections')
        .select('id, content')
        .eq('section_key', sectionKey)
        .eq('field_key', fieldKey)
        .single();

      // 2. 업데이트
      const { data: userData } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('page_sections')
        .update({
          content,
          updated_at: new Date().toISOString(),
          updated_by: userData.user?.id
        })
        .eq('section_key', sectionKey)
        .eq('field_key', fieldKey)
        .select()
        .single();

      if (error) throw error;

      // 3. 변경 이력 기록
      if (current && current.content !== content) {
        await supabase.from('section_edit_history').insert({
          table_name: 'page_sections',
          record_id: current.id,
          field_name: fieldKey,
          old_value: current.content,
          new_value: content,
          edited_by: userData.user?.id
        });
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['page-sections', variables.sectionKey]
      });
      queryClient.invalidateQueries({
        queryKey: ['page-sections-admin', variables.sectionKey]
      });
      toast.success('저장되었습니다');
    },
    onError: (error: Error) => {
      toast.error('저장 실패: ' + error.message);
    }
  });
}

// 여러 필드 일괄 업데이트
export function useBatchUpdatePageSection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sectionKey,
      updates
    }: {
      sectionKey: string;
      updates: Record<string, string>;
    }) => {
      const { data: userData } = await supabase.auth.getUser();

      for (const [fieldKey, content] of Object.entries(updates)) {
        // 현재 값 조회
        const { data: current } = await supabase
          .from('page_sections')
          .select('id, content')
          .eq('section_key', sectionKey)
          .eq('field_key', fieldKey)
          .single();

        // 업데이트
        const { error } = await supabase
          .from('page_sections')
          .update({
            content,
            updated_at: new Date().toISOString(),
            updated_by: userData.user?.id
          })
          .eq('section_key', sectionKey)
          .eq('field_key', fieldKey);

        if (error) throw error;

        // 변경 이력 기록
        if (current && current.content !== content) {
          await supabase.from('section_edit_history').insert({
            table_name: 'page_sections',
            record_id: current.id,
            field_name: fieldKey,
            old_value: current.content,
            new_value: content,
            edited_by: userData.user?.id
          });
        }
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['page-sections', variables.sectionKey]
      });
      queryClient.invalidateQueries({
        queryKey: ['page-sections-admin', variables.sectionKey]
      });
      toast.success('저장되었습니다');
    },
    onError: (error: Error) => {
      toast.error('저장 실패: ' + error.message);
    }
  });
}
