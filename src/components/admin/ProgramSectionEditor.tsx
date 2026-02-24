import { useState, useEffect, useRef, useCallback } from 'react';
import { usePageSectionAdmin, useBatchUpdatePageSection } from '@/hooks/usePageSections';
import { useOperatingHoursAdmin, useUpdateOperatingHour } from '@/hooks/useOperatingHours';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { CharacterCounter } from './CharacterCounter';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import type { OperatingHour } from '@/lib/supabase/types/admin-cms';
import { Loader2, Save, Pencil, RotateCcw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ProgramSectionEditor() {
  const { data: fields, isLoading: fieldsLoading } = usePageSectionAdmin('program');
  const { data: hours, isLoading: hoursLoading } = useOperatingHoursAdmin();
  const batchUpdate = useBatchUpdatePageSection();
  const updateHour = useUpdateOperatingHour();

  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const initialValuesRef = useRef<Record<string, string>>({});
  const [editingHour, setEditingHour] = useState<OperatingHour | null>(null);
  const [hourForm, setHourForm] = useState({
    schedule_label: '',
    operating_hours: '',
    study_hours: '',
  });

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

  // 편집 모드 시 hourForm 설정 - 폼 상태 초기화
  useEffect(() => {
    if (editingHour) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHourForm({
        schedule_label: editingHour.schedule_label,
        operating_hours: editingHour.operating_hours ?? '',
        study_hours: editingHour.study_hours ?? '',
      });
    }
  }, [editingHour]);

  // 원래대로 되돌리기 (useCallback은 early return 전에 호출되어야 함)
  const handleReset = useCallback(() => {
    setFormValues(initialValuesRef.current);
    setHasChanges(false);
  }, []);

  if (fieldsLoading || hoursLoading) {
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
        sectionKey: 'program',
        updates: changedValues
      });
    }
    setHasChanges(false);
    setLastSavedAt(new Date());
    initialValuesRef.current = { ...formValues };
  };

  const handleHourSave = async () => {
    if (editingHour) {
      await updateHour.mutateAsync({
        id: editingHour.id,
        schedule_label: hourForm.schedule_label,
        operating_hours: hourForm.operating_hours || null,
        study_hours: hourForm.study_hours || null,
      });
      setEditingHour(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="badge">배지 텍스트</Label>
                <CharacterCounter current={getFieldValue('badge').length} max={20} />
              </div>
              <Input
                id="badge"
                value={getFieldValue('badge')}
                onChange={(e) => handleFieldChange('badge', e.target.value)}
                placeholder="PROGRAM"
                maxLength={20}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="title">섹션 제목</Label>
                <CharacterCounter current={getFieldValue('title').length} max={40} />
              </div>
              <Input
                id="title"
                value={getFieldValue('title')}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                maxLength={40}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 프로그램 배너 */}
      <Card>
        <CardHeader>
          <CardTitle>프로그램 배너</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="status_badge">상태 배지</Label>
                <CharacterCounter current={getFieldValue('status_badge').length} max={20} />
              </div>
              <Input
                id="status_badge"
                value={getFieldValue('status_badge')}
                onChange={(e) => handleFieldChange('status_badge', e.target.value)}
                placeholder="NOW OPEN"
                maxLength={20}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="banner_title">배너 제목</Label>
                <CharacterCounter current={getFieldValue('banner_title').length} max={40} />
              </div>
              <Input
                id="banner_title"
                value={getFieldValue('banner_title')}
                onChange={(e) => handleFieldChange('banner_title', e.target.value)}
                maxLength={40}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="banner_desc_1">배너 설명 1</Label>
              <CharacterCounter current={getFieldValue('banner_desc_1').length} max={150} />
            </div>
            <Textarea
              id="banner_desc_1"
              value={getFieldValue('banner_desc_1')}
              onChange={(e) => handleFieldChange('banner_desc_1', e.target.value)}
              rows={2}
              maxLength={150}
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="banner_desc_2">배너 설명 2</Label>
              <CharacterCounter current={getFieldValue('banner_desc_2').length} max={150} />
            </div>
            <Textarea
              id="banner_desc_2"
              value={getFieldValue('banner_desc_2')}
              onChange={(e) => handleFieldChange('banner_desc_2', e.target.value)}
              rows={2}
              maxLength={150}
            />
          </div>
        </CardContent>
      </Card>

      {/* 프로그램 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>프로그램 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="start_date">개강일</Label>
                <CharacterCounter current={getFieldValue('start_date').length} max={30} />
              </div>
              <Input
                id="start_date"
                value={getFieldValue('start_date')}
                onChange={(e) => handleFieldChange('start_date', e.target.value)}
                maxLength={30}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="duration_cost">기간/비용</Label>
                <CharacterCounter current={getFieldValue('duration_cost').length} max={30} />
              </div>
              <Input
                id="duration_cost"
                value={getFieldValue('duration_cost')}
                onChange={(e) => handleFieldChange('duration_cost', e.target.value)}
                maxLength={30}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="capacity">모집정원</Label>
                <CharacterCounter current={getFieldValue('capacity').length} max={20} />
              </div>
              <Input
                id="capacity"
                value={getFieldValue('capacity')}
                onChange={(e) => handleFieldChange('capacity', e.target.value)}
                maxLength={20}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 버튼 설정 */}
      <Card>
        <CardHeader>
          <CardTitle>버튼 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="cta_primary">메인 버튼 텍스트</Label>
                <CharacterCounter current={getFieldValue('cta_primary').length} max={20} />
              </div>
              <Input
                id="cta_primary"
                value={getFieldValue('cta_primary')}
                onChange={(e) => handleFieldChange('cta_primary', e.target.value)}
                maxLength={20}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="cta_secondary">서브 버튼 텍스트</Label>
                <CharacterCounter current={getFieldValue('cta_secondary').length} max={20} />
              </div>
              <Input
                id="cta_secondary"
                value={getFieldValue('cta_secondary')}
                onChange={(e) => handleFieldChange('cta_secondary', e.target.value)}
                maxLength={20}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="phone">전화번호</Label>
                <CharacterCounter current={getFieldValue('phone').length} max={15} />
              </div>
              <Input
                id="phone"
                value={getFieldValue('phone')}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="01044083790"
                maxLength={15}
              />
              <p className="text-sm text-muted-foreground mt-1">하이픈(-) 없이 숫자만</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 운영시간 */}
      <Card>
        <CardHeader>
          <CardTitle>운영시간 안내</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {hours?.map(hour => (
              <div
                key={hour.id}
                className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
              >
                <div>
                  <p className="font-medium">{hour.schedule_label}</p>
                  <p className="text-sm text-muted-foreground">
                    운영: {hour.operating_hours}
                    {hour.study_hours && ` / 학습: ${hour.study_hours}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingHour(hour)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 운영시간 편집 모달 */}
      <Dialog open={!!editingHour} onOpenChange={() => setEditingHour(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>운영시간 편집</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="schedule_label">레이블</Label>
              <Input
                id="schedule_label"
                value={hourForm.schedule_label}
                onChange={(e) => setHourForm(prev => ({ ...prev, schedule_label: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="operating_hours">운영 시간</Label>
              <Input
                id="operating_hours"
                value={hourForm.operating_hours}
                onChange={(e) => setHourForm(prev => ({ ...prev, operating_hours: e.target.value }))}
                placeholder="08:00 ~ 22:00"
              />
            </div>

            <div>
              <Label htmlFor="study_hours">학습 시간 (선택)</Label>
              <Input
                id="study_hours"
                value={hourForm.study_hours}
                onChange={(e) => setHourForm(prev => ({ ...prev, study_hours: e.target.value }))}
                placeholder="10:00 ~ 22:00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setEditingHour(null)}>
              취소
            </Button>
            <Button onClick={handleHourSave} disabled={updateHour.isPending}>
              {updateHour.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              저장
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
