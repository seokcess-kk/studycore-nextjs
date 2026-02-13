import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  aspectRatio?: number;
  maxSizeMB?: number;
}

export function ImageUploader({
  value,
  onChange,
  bucket = 'space-images',
  aspectRatio = 16 / 9,
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 체크
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`파일 크기는 ${maxSizeMB}MB 이하여야 합니다`);
      return;
    }

    // 파일 형식 체크
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('JPG, PNG, WebP 형식만 지원됩니다');
      return;
    }

    setIsUploading(true);

    try {
      // 고유 파일명 생성
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
      const filePath = fileName;

      // Supabase Storage 업로드
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Public URL 가져오기
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('이미지가 업로드되었습니다');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
      toast.error('업로드 실패: ' + errorMessage);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  // 로컬 이미지 경로인지 확인 (assets 폴더의 이미지)
  const isLocalImage = value && (value.startsWith('/assets') || value.includes('/src/assets'));

  return (
    <div className="space-y-3">
      {value ? (
        <div className="relative">
          <div
            className="relative overflow-hidden rounded-lg border bg-muted"
            style={{ paddingBottom: `${(1 / aspectRatio) * 100}%` }}
          >
            <img
              src={value}
              alt="Preview"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                // 이미지 로드 실패 시 placeholder 표시
                (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23f1f5f9" width="100" height="100"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2394a3b8">No Image</text></svg>';
              }}
            />
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              title="이미지 변경"
            >
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )}
            </Button>
            {!isLocalImage && (
              <Button
                type="button"
                size="icon"
                variant="destructive"
                onClick={handleRemove}
                title="이미지 제거"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary transition-colors bg-muted/50"
          style={{ aspectRatio }}
        >
          {isUploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          ) : (
            <>
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                클릭하여 이미지 업로드
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WebP (최대 {maxSizeMB}MB)
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
