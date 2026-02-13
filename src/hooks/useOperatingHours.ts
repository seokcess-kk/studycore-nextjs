import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { OperatingHour } from '@/lib/supabase/types/admin-cms';
import { toast } from 'sonner';

// 공개용: 활성 운영시간만 조회
export function useOperatingHours() {
  return useQuery({
    queryKey: ['operating-hours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operating_hours')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as OperatingHour[];
    },
    staleTime: 1000 * 60 * 5,
  });
}

// 관리자용: 모든 운영시간 조회
export function useOperatingHoursAdmin() {
  return useQuery({
    queryKey: ['operating-hours-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('operating_hours')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data as OperatingHour[];
    },
  });
}

// 운영시간 수정
export function useUpdateOperatingHour() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OperatingHour> & { id: string }) => {
      const { data: userData } = await supabase.auth.getUser();

      // 이력 기록용 현재 값 조회
      const { data: current } = await supabase
        .from('operating_hours')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('operating_hours')
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
          key => current[key as keyof OperatingHour] !== updates[key as keyof typeof updates]
        );

        for (const field of changedFields) {
          await supabase.from('section_edit_history').insert({
            table_name: 'operating_hours',
            record_id: id,
            field_name: field,
            old_value: String(current[field as keyof OperatingHour] ?? ''),
            new_value: String(updates[field as keyof typeof updates] ?? ''),
            edited_by: userData.user?.id
          });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operating-hours'] });
      queryClient.invalidateQueries({ queryKey: ['operating-hours-admin'] });
      toast.success('저장되었습니다');
    },
    onError: (error: Error) => {
      toast.error('저장 실패: ' + error.message);
    }
  });
}
