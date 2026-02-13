import { useState, useEffect } from 'react';
import { usePageSectionAdmin, useBatchUpdatePageSection } from '@/hooks/usePageSections';
import { useOperatingHoursAdmin, useUpdateOperatingHour } from '@/hooks/useOperatingHours';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { OperatingHour } from '@/lib/supabase/types/admin-cms';
import { Loader2, Save, Pencil } from 'lucide-react';
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
  const [editingHour, setEditingHour] = useState<OperatingHour | null>(null);
  const [hourForm, setHourForm] = useState({
    schedule_label: '',
    operating_hours: '',
    study_hours: '',
  });

  useEffect(() => {
    if (fields) {
      const values: Record<string, string> = {};
      fields.forEach(f => {
        values[f.field_key] = f.content;
      });
      setFormValues(values);
    }
  }, [fields]);

  useEffect(() => {
    if (editingHour) {
      setHourForm({
        schedule_label: editingHour.schedule_label,
        operating_hours: editingHour.operating_hours ?? '',
        study_hours: editingHour.study_hours ?? '',
      });
    }
  }, [editingHour]);

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
                placeholder="PROGRAM"
              />
            </div>
            <div>
              <Label htmlFor="title">섹션 제목</Label>
              <Input
                id="title"
                value={getFieldValue('title')}
                onChange={(e) => handleFieldChange('title', e.target.value)}
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
              <Label htmlFor="status_badge">상태 배지</Label>
              <Input
                id="status_badge"
                value={getFieldValue('status_badge')}
                onChange={(e) => handleFieldChange('status_badge', e.target.value)}
                placeholder="NOW OPEN"
              />
            </div>
            <div>
              <Label htmlFor="banner_title">배너 제목</Label>
              <Input
                id="banner_title"
                value={getFieldValue('banner_title')}
                onChange={(e) => handleFieldChange('banner_title', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="banner_desc_1">배너 설명 1</Label>
            <Textarea
              id="banner_desc_1"
              value={getFieldValue('banner_desc_1')}
              onChange={(e) => handleFieldChange('banner_desc_1', e.target.value)}
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="banner_desc_2">배너 설명 2</Label>
            <Textarea
              id="banner_desc_2"
              value={getFieldValue('banner_desc_2')}
              onChange={(e) => handleFieldChange('banner_desc_2', e.target.value)}
              rows={2}
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
              <Label htmlFor="start_date">개강일</Label>
              <Input
                id="start_date"
                value={getFieldValue('start_date')}
                onChange={(e) => handleFieldChange('start_date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="duration_cost">기간/비용</Label>
              <Input
                id="duration_cost"
                value={getFieldValue('duration_cost')}
                onChange={(e) => handleFieldChange('duration_cost', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="capacity">모집정원</Label>
              <Input
                id="capacity"
                value={getFieldValue('capacity')}
                onChange={(e) => handleFieldChange('capacity', e.target.value)}
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
            <div>
              <Label htmlFor="phone">전화번호</Label>
              <Input
                id="phone"
                value={getFieldValue('phone')}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="01044083790"
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
