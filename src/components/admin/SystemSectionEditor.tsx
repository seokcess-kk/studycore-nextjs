import { useState, useEffect } from 'react';
import { usePageSectionAdmin, useBatchUpdatePageSection } from '@/hooks/usePageSections';
import { useSystemCardsAdmin, useReorderSystemCards, useDeleteSystemCard } from '@/hooks/useSystemCards';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SortableList } from './SortableList';
import { SystemCardModal } from './SystemCardModal';
import type { SystemCard } from '@/lib/supabase/types/admin-cms';
import { Loader2, Plus, Pencil, Trash2, GripVertical, Save } from 'lucide-react';
import { Icon } from '@iconify/react';
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

const colorClasses: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  orange: 'bg-orange-100 text-orange-700',
  teal: 'bg-teal-100 text-teal-700',
};

export function SystemSectionEditor() {
  const { data: fields, isLoading: fieldsLoading } = usePageSectionAdmin('system');
  const { data: cards, isLoading: cardsLoading } = useSystemCardsAdmin();
  const batchUpdate = useBatchUpdatePageSection();
  const reorderCards = useReorderSystemCards();
  const deleteCard = useDeleteSystemCard();

  const [editingCard, setEditingCard] = useState<SystemCard | null>(null);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SystemCard | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // 필드 초기값 설정 - 외부 데이터를 로컬 상태로 동기화
  useEffect(() => {
    if (fields) {
      const values: Record<string, string> = {};
      fields.forEach(f => {
        values[f.field_key] = f.content;
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormValues(values);
    }
  }, [fields]);

  if (fieldsLoading || cardsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getFieldValue = (fieldKey: string) => formValues[fieldKey] ?? '';

  const handleFieldChange = (fieldKey: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldKey]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const originalValues: Record<string, string> = {};
    fields?.forEach(f => {
      originalValues[f.field_key] = f.content;
    });

    const changedValues: Record<string, string> = {};
    for (const [key, value] of Object.entries(formValues)) {
      if (originalValues[key] !== value) {
        changedValues[key] = value;
      }
    }

    if (Object.keys(changedValues).length > 0) {
      await batchUpdate.mutateAsync({
        sectionKey: 'system',
        updates: changedValues
      });
    }
    setHasChanges(false);
  };

  const handleReorder = (reorderedCards: SystemCard[]) => {
    reorderCards.mutate(reorderedCards.map(c => c.id));
  };

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 편집 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>섹션 헤더</CardTitle>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || batchUpdate.isPending}
          >
            {batchUpdate.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            저장
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="badge">배지 텍스트</Label>
              <Input
                id="badge"
                value={getFieldValue('badge')}
                onChange={(e) => handleFieldChange('badge', e.target.value)}
                placeholder="MANAGEMENT SYSTEM"
              />
            </div>
            <div>
              <Label htmlFor="title">메인 제목</Label>
              <Input
                id="title"
                value={getFieldValue('title')}
                onChange={(e) => handleFieldChange('title', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description_1">설명 1</Label>
            <Textarea
              id="description_1"
              value={getFieldValue('description_1')}
              onChange={(e) => handleFieldChange('description_1', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="description_2">설명 2</Label>
            <Textarea
              id="description_2"
              value={getFieldValue('description_2')}
              onChange={(e) => handleFieldChange('description_2', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* 시스템 카드 목록 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>시스템 카드</CardTitle>
          <Button onClick={() => setIsAddingCard(true)}>
            <Plus className="w-4 h-4 mr-2" />
            카드 추가
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            드래그하여 순서를 변경할 수 있습니다
          </p>

          <SortableList
            items={cards ?? []}
            onReorder={handleReorder}
            renderItem={(card) => (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab flex-shrink-0" />

                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses[card.color_theme]}`}>
                  <Icon icon={card.icon_name} className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium">{card.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {card.subtitle}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded text-xs ${
                    card.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {card.is_active ? '활성' : '비활성'}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingCard(card)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(card)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* 카드 편집 모달 */}
      <SystemCardModal
        card={editingCard}
        isOpen={!!editingCard || isAddingCard}
        onClose={() => {
          setEditingCard(null);
          setIsAddingCard(false);
        }}
        nextSortOrder={(cards?.length ?? 0) + 1}
      />

      {/* 삭제 확인 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>카드 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.title}&quot; 카드를 삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteCard.mutate(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
