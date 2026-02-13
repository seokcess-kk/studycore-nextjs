import { useEffect, useState } from 'react';
import { useCreateSystemCard, useUpdateSystemCard } from '@/hooks/useSystemCards';
import type { SystemCard } from '@/lib/supabase/types/admin-cms';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
import { Icon } from '@iconify/react';

interface SystemCardModalProps {
  card: SystemCard | null;
  isOpen: boolean;
  onClose: () => void;
  nextSortOrder: number;
}

const iconOptions = [
  { value: 'solar:users-group-rounded-bold', label: '사용자' },
  { value: 'solar:clipboard-check-bold', label: '체크리스트' },
  { value: 'solar:book-bookmark-bold', label: '책' },
  { value: 'solar:buildings-3-bold', label: '건물' },
  { value: 'solar:shield-check-bold', label: '방패' },
  { value: 'solar:star-bold', label: '별' },
];

const colorOptions: { value: 'blue' | 'purple' | 'orange' | 'teal'; label: string; class: string }[] = [
  { value: 'blue', label: '파랑', class: 'bg-blue-500' },
  { value: 'purple', label: '보라', class: 'bg-purple-500' },
  { value: 'orange', label: '주황', class: 'bg-orange-500' },
  { value: 'teal', label: '청록', class: 'bg-teal-500' },
];

export function SystemCardModal({
  card,
  isOpen,
  onClose,
  nextSortOrder
}: SystemCardModalProps) {
  const createCard = useCreateSystemCard();
  const updateCard = useUpdateSystemCard();
  const isEditing = !!card;

  const [form, setForm] = useState<{
    title: string;
    subtitle: string;
    description: string;
    icon_name: string;
    color_theme: 'blue' | 'purple' | 'orange' | 'teal';
    is_active: boolean;
  }>({
    title: '',
    subtitle: '',
    description: '',
    icon_name: 'solar:users-group-rounded-bold',
    color_theme: 'blue',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (card) {
      setForm({
        title: card.title,
        subtitle: card.subtitle,
        description: card.description,
        icon_name: card.icon_name,
        color_theme: card.color_theme,
        is_active: card.is_active,
      });
    } else {
      setForm({
        title: '',
        subtitle: '',
        description: '',
        icon_name: 'solar:users-group-rounded-bold',
        color_theme: 'blue',
        is_active: true,
      });
    }
    setErrors({});
  }, [card, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = '제목을 입력해주세요';
    if (!form.subtitle.trim()) newErrors.subtitle = '부제목을 입력해주세요';
    if (!form.description.trim()) newErrors.description = '설명을 입력해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (isEditing) {
      await updateCard.mutateAsync({
        id: card.id,
        ...form,
      });
    } else {
      await createCard.mutateAsync({
        ...form,
        sort_order: nextSortOrder,
      });
    }
    onClose();
  };

  const isPending = createCard.isPending || updateCard.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '시스템 카드 편집' : '새 시스템 카드 추가'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="생활관리"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="subtitle">부제목 (한 줄 요약) *</Label>
            <Input
              id="subtitle"
              value={form.subtitle}
              onChange={(e) => setForm(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="출결관리, 휴대폰 수거, 상시 순찰"
              className={errors.subtitle ? 'border-destructive' : ''}
            />
            {errors.subtitle && (
              <p className="text-sm text-destructive mt-1">{errors.subtitle}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">상세 설명 *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="집중을 방해하는 모든 요소를 제거하고..."
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label>아이콘 선택</Label>
            <div className="flex gap-2 mt-2">
              {iconOptions.map(icon => (
                <Button
                  key={icon.value}
                  type="button"
                  variant={form.icon_name === icon.value ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setForm(prev => ({ ...prev, icon_name: icon.value }))}
                  title={icon.label}
                >
                  <Icon icon={icon.value} className="w-5 h-5" />
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label>색상 테마</Label>
            <div className="flex gap-2 mt-2">
              {colorOptions.map(color => (
                <Button
                  key={color.value}
                  type="button"
                  variant={form.color_theme === color.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setForm(prev => ({ ...prev, color_theme: color.value }))}
                  className="gap-2"
                >
                  <div className={`w-3 h-3 rounded-full ${color.class}`} />
                  {color.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <Label className="text-base">활성화 상태</Label>
              <p className="text-sm text-muted-foreground">이 카드를 홈페이지에 표시</p>
            </div>
            <Switch
              checked={form.is_active}
              onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_active: checked }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
