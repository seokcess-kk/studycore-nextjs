import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { SystemCard, SystemCardForm } from '@/lib/supabase/types/admin-cms';
import { toast } from 'sonner';

// 공개용: 활성 카드만 조회
export function useSystemCards() {
  return useQuery({
    queryKey: ['system-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_cards')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (error) throw error;
      return data as SystemCard[];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
}

// 관리자용: 모든 카드 조회
export function useSystemCardsAdmin() {
  return useQuery({
    queryKey: ['system-cards-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_cards')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data as SystemCard[];
    },
  });
}

// 카드 생성
export function useCreateSystemCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: SystemCardForm & { sort_order: number }) => {
      const { data, error } = await supabase
        .from('system_cards')
        .insert(card)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-cards'] });
      queryClient.invalidateQueries({ queryKey: ['system-cards-admin'] });
      toast.success('카드가 추가되었습니다');
    },
    onError: (error: Error) => {
      toast.error('추가 실패: ' + error.message);
    }
  });
}

// 카드 수정
export function useUpdateSystemCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SystemCard> & { id: string }) => {
      const { data: userData } = await supabase.auth.getUser();

      // 이력 기록용 현재 값 조회
      const { data: current } = await supabase
        .from('system_cards')
        .select('*')
        .eq('id', id)
        .single();

      const { data, error } = await supabase
        .from('system_cards')
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
          key => current[key as keyof SystemCard] !== updates[key as keyof typeof updates]
        );

        for (const field of changedFields) {
          await supabase.from('section_edit_history').insert({
            table_name: 'system_cards',
            record_id: id,
            field_name: field,
            old_value: String(current[field as keyof SystemCard] ?? ''),
            new_value: String(updates[field as keyof typeof updates] ?? ''),
            edited_by: userData.user?.id
          });
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-cards'] });
      queryClient.invalidateQueries({ queryKey: ['system-cards-admin'] });
      queryClient.refetchQueries({ queryKey: ['system-cards'], type: 'active' });
      toast.success('저장 완료! 메인 페이지에 반영되었습니다.');
    },
    onError: (error: Error) => {
      toast.error('저장 실패: ' + error.message);
    }
  });
}

// 카드 삭제
export function useDeleteSystemCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_cards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-cards'] });
      queryClient.invalidateQueries({ queryKey: ['system-cards-admin'] });
      toast.success('카드가 삭제되었습니다');
    },
    onError: (error: Error) => {
      toast.error('삭제 실패: ' + error.message);
    }
  });
}

// 순서 변경
export function useReorderSystemCards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      for (let i = 0; i < orderedIds.length; i++) {
        const { error } = await supabase
          .from('system_cards')
          .update({ sort_order: i + 1 })
          .eq('id', orderedIds[i]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-cards'] });
      queryClient.invalidateQueries({ queryKey: ['system-cards-admin'] });
      toast.success('순서가 변경되었습니다');
    },
    onError: (error: Error) => {
      toast.error('순서 변경 실패: ' + error.message);
    }
  });
}
