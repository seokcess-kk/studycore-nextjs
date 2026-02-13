import { useEffect, useState } from 'react';
import { useCreateSpaceSlide, useUpdateSpaceSlide } from '@/hooks/useSpaceSlides';
import type { SpaceSlide } from '@/lib/supabase/types/admin-cms';
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
import { ImageUploader } from './ImageUploader';
import { Loader2 } from 'lucide-react';

interface SpaceSlideModalProps {
  slide: SpaceSlide | null;
  isOpen: boolean;
  onClose: () => void;
  nextSortOrder: number;
}

export function SpaceSlideModal({
  slide,
  isOpen,
  onClose,
  nextSortOrder
}: SpaceSlideModalProps) {
  const createSlide = useCreateSpaceSlide();
  const updateSlide = useUpdateSpaceSlide();
  const isEditing = !!slide;

  const [form, setForm] = useState({
    title: '',
    description: '',
    image_url: '',
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // 편집 모드일 때 폼 값 설정
  useEffect(() => {
    if (slide) {
      setForm({
        title: slide.title,
        description: slide.description,
        image_url: slide.image_url,
        is_active: slide.is_active,
      });
    } else {
      setForm({
        title: '',
        description: '',
        image_url: '',
        is_active: true,
      });
    }
    setErrors({});
  }, [slide, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = '제목을 입력해주세요';
    if (!form.description.trim()) newErrors.description = '설명을 입력해주세요';
    if (!form.image_url.trim()) newErrors.image_url = '이미지를 업로드해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (isEditing) {
      await updateSlide.mutateAsync({
        id: slide.id,
        ...form,
      });
    } else {
      await createSlide.mutateAsync({
        ...form,
        sort_order: nextSortOrder,
      });
    }
    onClose();
  };

  const isPending = createSlide.isPending || updateSlide.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? '슬라이드 편집' : '새 슬라이드 추가'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <Label htmlFor="title">슬라이드 제목 *</Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="스터디코어 1.0"
              className={errors.title ? 'border-destructive' : ''}
            />
            <p className="text-sm text-muted-foreground mt-1">
              이미지 위에 표시되는 공간 이름
            </p>
            {errors.title && (
              <p className="text-sm text-destructive mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">슬라이드 설명 *</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="학습관리의 첫 번째 완성형 시스템..."
              rows={3}
              className={errors.description ? 'border-destructive' : ''}
            />
            <p className="text-sm text-muted-foreground mt-1">
              이미지 아래 표시되는 상세 설명
            </p>
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description}</p>
            )}
          </div>

          <div>
            <Label>슬라이드 이미지 *</Label>
            <div className="mt-2">
              <ImageUploader
                value={form.image_url}
                onChange={(url) => setForm(prev => ({ ...prev, image_url: url }))}
                bucket="space-images"
                aspectRatio={16 / 9}
              />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              권장: 1920x1080px, JPG/PNG, 최대 5MB
            </p>
            {errors.image_url && (
              <p className="text-sm text-destructive mt-1">{errors.image_url}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label className="text-base">활성화 상태</Label>
              <p className="text-sm text-muted-foreground">
                이 슬라이드를 캐러셀에 표시
              </p>
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
