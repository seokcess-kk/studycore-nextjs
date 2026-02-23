import { useState, useEffect } from 'react';
import { usePageSectionAdmin, useBatchUpdatePageSection } from '@/hooks/usePageSections';
import { useHeroStatsAdmin, useUpdateHeroStat, useDeleteHeroStat, useReorderHeroStats, useCreateHeroStat } from '@/hooks/useHeroStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SortableList } from './SortableList';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import type { HeroStat } from '@/lib/supabase/types/admin-cms';

export function HeroSectionEditor() {
  const { data: fields, isLoading: fieldsLoading } = usePageSectionAdmin('hero');
  const { data: stats, isLoading: statsLoading } = useHeroStatsAdmin();
  const batchUpdate = useBatchUpdatePageSection();
  const updateStat = useUpdateHeroStat();
  const deleteStat = useDeleteHeroStat();
  const reorderStats = useReorderHeroStats();
  const createStat = useCreateHeroStat();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [editingStat, setEditingStat] = useState<HeroStat | null>(null);
  const [isAddingStat, setIsAddingStat] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<HeroStat | null>(null);
  const [statForm, setStatForm] = useState({
    stat_value: '',
    stat_label: '',
    icon_name: 'solar:star-bold',
    is_active: true,
  });

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

  // 편집 모드 시 statForm 설정 - 폼 상태 초기화
  useEffect(() => {
    if (editingStat) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatForm({
        stat_value: editingStat.stat_value,
        stat_label: editingStat.stat_label,
        icon_name: editingStat.icon_name,
        is_active: editingStat.is_active,
      });
    } else if (isAddingStat) {
      setStatForm({
        stat_value: '',
        stat_label: '',
        icon_name: 'solar:star-bold',
        is_active: true,
      });
    }
  }, [editingStat, isAddingStat]);

  if (fieldsLoading || statsLoading) {
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

    // 변경된 값만 추출
    const changedValues: Record<string, string> = {};
    for (const [key, value] of Object.entries(formValues)) {
      if (originalValues[key] !== value) {
        changedValues[key] = value;
      }
    }

    if (Object.keys(changedValues).length > 0) {
      await batchUpdate.mutateAsync({
        sectionKey: 'hero',
        updates: changedValues
      });
    }
    setHasChanges(false);
  };

  const handleReorder = (reorderedStats: HeroStat[]) => {
    reorderStats.mutate(reorderedStats.map(s => s.id));
  };

  const handleStatSave = async () => {
    if (editingStat) {
      await updateStat.mutateAsync({
        id: editingStat.id,
        ...statForm
      });
    } else {
      await createStat.mutateAsync({
        ...statForm,
        sort_order: (stats?.length ?? 0) + 1
      });
    }
    setEditingStat(null);
    setIsAddingStat(false);
  };

  const iconOptions = [
    { value: 'solar:armchair-bold', label: '좌석' },
    { value: 'solar:shield-check-bold', label: '방패' },
    { value: 'solar:user-speak-bold', label: '멘토' },
    { value: 'solar:star-bold', label: '별' },
    { value: 'solar:clock-circle-bold', label: '시계' },
    { value: 'solar:book-bold', label: '책' },
  ];

  return (
    <div className="space-y-6">
      {/* 기본 정보 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>기본 정보</CardTitle>
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
          <div>
            <Label htmlFor="badge">상단 배지</Label>
            <Input
              id="badge"
              value={getFieldValue('badge')}
              onChange={(e) => handleFieldChange('badge', e.target.value)}
              placeholder="PREMIUM MANAGED STUDY CENTER"
            />
            <p className="text-sm text-muted-foreground mt-1">영문 대문자로 짧은 슬로건 입력</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headline_1">메인 헤드라인 (1줄)</Label>
              <Input
                id="headline_1"
                value={getFieldValue('headline_1')}
                onChange={(e) => handleFieldChange('headline_1', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="headline_2">메인 헤드라인 (2줄, 강조)</Label>
              <Input
                id="headline_2"
                value={getFieldValue('headline_2')}
                onChange={(e) => handleFieldChange('headline_2', e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">그라데이션 효과 적용</p>
            </div>
          </div>

          <div>
            <Label htmlFor="description_1">설명 텍스트 1</Label>
            <Textarea
              id="description_1"
              value={getFieldValue('description_1')}
              onChange={(e) => handleFieldChange('description_1', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="description_2">설명 텍스트 2</Label>
            <Textarea
              id="description_2"
              value={getFieldValue('description_2')}
              onChange={(e) => handleFieldChange('description_2', e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta_primary">메인 버튼 텍스트</Label>
              <Input
                id="cta_primary"
                value={getFieldValue('cta_primary')}
                onChange={(e) => handleFieldChange('cta_primary', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cta_secondary">서브 버튼 텍스트</Label>
              <Input
                id="cta_secondary"
                value={getFieldValue('cta_secondary')}
                onChange={(e) => handleFieldChange('cta_secondary', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 통계 카드 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>통계 카드</CardTitle>
          <Button onClick={() => setIsAddingStat(true)}>
            <Plus className="w-4 h-4 mr-2" />
            통계 추가
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            드래그하여 순서를 변경할 수 있습니다
          </p>

          <SortableList
            items={stats ?? []}
            onReorder={handleReorder}
            renderItem={(stat) => (
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />

                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon icon={stat.icon_name} className="w-5 h-5 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-lg">{stat.stat_value}</p>
                  <p className="text-sm text-muted-foreground">{stat.stat_label}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    stat.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-500'
                  }`}>
                    {stat.is_active ? '활성' : '비활성'}
                  </span>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingStat(stat)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteTarget(stat)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* 통계 편집 모달 */}
      <Dialog open={!!editingStat || isAddingStat} onOpenChange={() => { setEditingStat(null); setIsAddingStat(false); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingStat ? '통계 편집' : '새 통계 추가'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="stat_value">값 *</Label>
              <Input
                id="stat_value"
                value={statForm.stat_value}
                onChange={(e) => setStatForm(prev => ({ ...prev, stat_value: e.target.value }))}
                placeholder="100+"
              />
            </div>

            <div>
              <Label htmlFor="stat_label">레이블 *</Label>
              <Input
                id="stat_label"
                value={statForm.stat_label}
                onChange={(e) => setStatForm(prev => ({ ...prev, stat_label: e.target.value }))}
                placeholder="프리미엄 좌석"
              />
            </div>

            <div>
              <Label>아이콘 선택</Label>
              <div className="flex gap-2 mt-2">
                {iconOptions.map(icon => (
                  <Button
                    key={icon.value}
                    type="button"
                    variant={statForm.icon_name === icon.value ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => setStatForm(prev => ({ ...prev, icon_name: icon.value }))}
                    title={icon.label}
                  >
                    <Icon icon={icon.value} className="w-5 h-5" />
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div>
                <Label className="text-base">활성화 상태</Label>
                <p className="text-sm text-muted-foreground">이 통계를 홈페이지에 표시</p>
              </div>
              <Switch
                checked={statForm.is_active}
                onCheckedChange={(checked) => setStatForm(prev => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => { setEditingStat(null); setIsAddingStat(false); }}>
              취소
            </Button>
            <Button
              onClick={handleStatSave}
              disabled={!statForm.stat_value || !statForm.stat_label || updateStat.isPending || createStat.isPending}
            >
              {(updateStat.isPending || createStat.isPending) && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>통계 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleteTarget?.stat_value} - {deleteTarget?.stat_label}&quot; 통계를 삭제하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteStat.mutate(deleteTarget.id);
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
