import { useState, useEffect, useRef, useCallback } from 'react';
import { usePageSectionAdmin, useBatchUpdatePageSection } from '@/hooks/usePageSections';
import { useSpaceSlidesAdmin, useReorderSpaceSlides, useDeleteSpaceSlide } from '@/hooks/useSpaceSlides';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SortableList } from './SortableList';
import { SpaceSlideModal } from './SpaceSlideModal';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { CharacterCounter } from './CharacterCounter';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import type { SpaceSlide } from '@/lib/supabase/types/admin-cms';
import { Loader2, Plus, Pencil, Trash2, GripVertical, Save, RotateCcw } from 'lucide-react';
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

export function SpaceSectionEditor() {
  const { data: fields, isLoading: fieldsLoading } = usePageSectionAdmin('space');
  const { data: slides, isLoading: slidesLoading } = useSpaceSlidesAdmin();
  const batchUpdate = useBatchUpdatePageSection();
  const reorderSlides = useReorderSpaceSlides();
  const deleteSlide = useDeleteSpaceSlide();

  const [editingSlide, setEditingSlide] = useState<SpaceSlide | null>(null);
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SpaceSlide | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const initialValuesRef = useRef<Record<string, string>>({});

  // 페이지 이탈 경고
  useUnsavedChangesWarning(hasChanges);

  // 필드 초기값 설정 - 외부 데이터를 로컬 상태로 동기화
  useEffect(() => {
    if (fields) {
      const values: Record<string, string> = {};
      fields.forEach(f => {
        values[f.field_key] = f.content;
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormValues(values);
      initialValuesRef.current = values;
    }
  }, [fields]);

  // 원래대로 되돌리기 (useCallback은 early return 전에 호출되어야 함)
  const handleReset = useCallback(() => {
    setFormValues(initialValuesRef.current);
    setHasChanges(false);
  }, []);

  if (fieldsLoading || slidesLoading) {
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
        sectionKey: 'space',
        updates: changedValues
      });
    }
    setHasChanges(false);
    setLastSavedAt(new Date());
    initialValuesRef.current = { ...formValues };
  };

  const handleReorder = (reorderedSlides: SpaceSlide[]) => {
    reorderSlides.mutate(reorderedSlides.map(s => s.id));
  };

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 편집 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>섹션 헤더</CardTitle>
            <SaveStatusIndicator
              hasChanges={hasChanges}
              isPending={batchUpdate.isPending}
              lastSavedAt={lastSavedAt}
            />
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                원래대로
              </Button>
            )}
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
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="badge">배지 텍스트</Label>
              <CharacterCounter current={getFieldValue('badge').length} max={30} />
            </div>
            <Input
              id="badge"
              value={getFieldValue('badge')}
              onChange={(e) => handleFieldChange('badge', e.target.value)}
              placeholder="PREMIUM SPACE"
              maxLength={30}
            />
            <p className="text-sm text-muted-foreground mt-1">영문 대문자로 입력</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="title_1">제목 1</Label>
                <CharacterCounter current={getFieldValue('title_1').length} max={20} />
              </div>
              <Input
                id="title_1"
                value={getFieldValue('title_1')}
                onChange={(e) => handleFieldChange('title_1', e.target.value)}
                maxLength={20}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="title_2">제목 2 (강조)</Label>
                <CharacterCounter current={getFieldValue('title_2').length} max={20} />
              </div>
              <Input
                id="title_2"
                value={getFieldValue('title_2')}
                onChange={(e) => handleFieldChange('title_2', e.target.value)}
                maxLength={20}
              />
              <p className="text-sm text-muted-foreground mt-1">그라데이션 효과 적용</p>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="title_3">제목 3</Label>
                <CharacterCounter current={getFieldValue('title_3').length} max={20} />
              </div>
              <Input
                id="title_3"
                value={getFieldValue('title_3')}
                onChange={(e) => handleFieldChange('title_3', e.target.value)}
                maxLength={20}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="description">설명</Label>
              <CharacterCounter current={getFieldValue('description').length} max={200} />
            </div>
            <Textarea
              id="description"
              value={getFieldValue('description')}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={2}
              maxLength={200}
            />
          </div>
        </CardContent>
      </Card>

      {/* 슬라이드 목록 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>공간 슬라이드</CardTitle>
          <Button onClick={() => setIsAddingSlide(true)}>
            <Plus className="w-4 h-4 mr-2" />
            슬라이드 추가
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            드래그하여 순서를 변경할 수 있습니다
          </p>

          <SortableList
            items={slides ?? []}
            onReorder={handleReorder}
            renderItem={(slide) => (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab flex-shrink-0" />

                <div className="w-24 h-16 rounded overflow-hidden flex-shrink-0 bg-muted">
                  <img
                    src={slide.image_url}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f1f5f9" width="100" height="100"/></svg>';
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{slide.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {slide.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`px-2 py-1 rounded text-xs ${
                    slide.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {slide.is_active ? '활성' : '비활성'}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingSlide(slide)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(slide)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* 슬라이드 편집 모달 */}
      <SpaceSlideModal
        slide={editingSlide}
        isOpen={!!editingSlide || isAddingSlide}
        onClose={() => {
          setEditingSlide(null);
          setIsAddingSlide(false);
        }}
        nextSortOrder={(slides?.length ?? 0) + 1}
      />

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>슬라이드 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.title}&quot; 슬라이드를 삭제하시겠습니까?
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteSlide.mutate(deleteTarget.id);
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
