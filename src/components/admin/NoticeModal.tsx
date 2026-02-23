import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Icon } from '@iconify/react';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import ResizableImage, { ImageAlignment } from './ResizableImage';

interface Notice {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  show_as_popup: boolean;
  created_at: string;
  image_url?: string | null;
  image_urls?: string[] | null;
  attachment_url?: string | null;
  attachment_name?: string | null;
}

interface NoticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notice: Notice | null;
  onSave: (data: { 
    title: string; 
    content: string; 
    is_published: boolean; 
    show_as_popup: boolean;
    image_url?: string | null;
    image_urls?: string[];
    attachment_url?: string | null;
    attachment_name?: string | null;
  }) => void;
  loading?: boolean;
}

// Parse image markers and extract sizes and alignment
const parseImageMarkers = (content: string): Map<number, { width: number; alignment: ImageAlignment }> => {
  const data = new Map<number, { width: number; alignment: ImageAlignment }>();
  const regex = /\[IMG:(\d+)(?::(\d+))?(?::(left|center|right))?\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const index = parseInt(match[1], 10);
    const width = match[2] ? parseInt(match[2], 10) : 400;
    const alignment = (match[3] as ImageAlignment) || 'left';
    data.set(index, { width, alignment });
  }
  return data;
};

// Update image marker with new size
const updateImageSize = (content: string, index: number, width: number): string => {
  const regex = new RegExp(`\\[IMG:${index}(?::(\\d+))?(?::(left|center|right))?\\]`, 'g');
  return content.replace(regex, (_, __, alignment) => {
    return `[IMG:${index}:${Math.round(width)}${alignment ? `:${alignment}` : ''}]`;
  });
};

// Update image marker with new alignment
const updateImageAlignment = (content: string, index: number, alignment: ImageAlignment): string => {
  const regex = new RegExp(`\\[IMG:${index}(?::(\\d+))?(?::(left|center|right))?\\]`, 'g');
  return content.replace(regex, (_, widthStr) => {
    const width = widthStr ? parseInt(widthStr, 10) : 400;
    return `[IMG:${index}:${width}:${alignment}]`;
  });
};

// Get indices used in content
const getUsedIndices = (content: string): Set<number> => {
  const indices = new Set<number>();
  const regex = /\[IMG:(\d+)(?::\d+)?(?::(?:left|center|right))?\]/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    indices.add(parseInt(match[1], 10));
  }
  return indices;
};

export default function NoticeModal({ open, onOpenChange, notice, onSave, loading }: NoticeModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [showAsPopup, setShowAsPopup] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [attachmentUrl, setAttachmentUrl] = useState<string | null>(null);
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const _imageSizes = parseImageMarkers(content);
  const usedIndices = getUsedIndices(content);

  useEffect(() => {
    if (notice) {
      setTitle(notice.title);
      setContent(notice.content);
      setIsPublished(notice.is_published);
      setShowAsPopup(notice.show_as_popup);
      const urls = notice.image_urls?.length 
        ? notice.image_urls 
        : notice.image_url 
          ? [notice.image_url] 
          : [];
      setImageUrls(urls);
      setAttachmentUrl(notice.attachment_url || null);
      setAttachmentName(notice.attachment_name || null);
    } else {
      setTitle('');
      setContent('');
      setIsPublished(true);
      setShowAsPopup(false);
      setImageUrls([]);
      setAttachmentUrl(null);
      setAttachmentName(null);
    }
    setShowPreview(false);
  }, [notice, open]);

  const uploadFile = async (file: File, type: 'image' | 'attachment') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}-${Date.now()}.${fileExt}`;
    const filePath = `${type}s/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('notice-attachments')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from('notice-attachments')
      .getPublicUrl(filePath);

    return { url: data.publicUrl, name: file.name };
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const validFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}은(는) 이미지 파일이 아닙니다.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}의 크기가 10MB를 초과합니다.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setIsUploadingImage(true);
    try {
      const uploadPromises = validFiles.map(file => uploadFile(file, 'image'));
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.url);
      setImageUrls(prev => [...prev, ...newUrls]);
      toast.success(`${newUrls.length}개의 이미지가 업로드되었습니다.`);
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = '';
      }
    }
  };

  const handleInlineImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('이미지 크기는 10MB 이하여야 합니다.');
      return;
    }

    setIsUploadingInline(true);
    try {
      const { url } = await uploadFile(file, 'image');
      const newIndex = imageUrls.length;
      setImageUrls(prev => [...prev, url]);
      
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const marker = `[IMG:${newIndex}:400]`;
        const newContent = content.slice(0, start) + marker + content.slice(end);
        setContent(newContent);
        
        setTimeout(() => {
          textarea.focus();
          const newPos = start + marker.length;
          textarea.setSelectionRange(newPos, newPos);
        }, 0);
      }
      
      toast.success('이미지가 본문에 삽입되었습니다.');
    } catch (error) {
      console.error('Inline image upload error:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingInline(false);
      if (inlineImageInputRef.current) {
        inlineImageInputRef.current.value = '';
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error('파일 크기는 20MB 이하여야 합니다.');
      return;
    }

    setIsUploadingFile(true);
    try {
      const { url, name } = await uploadFile(file, 'attachment');
      setAttachmentUrl(url);
      setAttachmentName(name);
      toast.success('파일이 업로드되었습니다.');
    } catch (error) {
      console.error('File upload error:', error);
      toast.error('파일 업로드에 실패했습니다.');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeInlineImage = (index: number) => {
    // Remove all markers for this image from content
    const regex = new RegExp(`\\[IMG:${index}(?::\\d+)?\\]`, 'g');
    setContent(prev => prev.replace(regex, ''));
  };

  const removeAttachment = () => {
    setAttachmentUrl(null);
    setAttachmentName(null);
  };

  const handleImageResize = (index: number, width: number) => {
    setContent(prev => updateImageSize(prev, index, width));
  };

  const handleImageAlignmentChange = (index: number, alignment: ImageAlignment) => {
    setContent(prev => updateImageAlignment(prev, index, alignment));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSave({ 
      title: title.trim(), 
      content: content.trim(), 
      is_published: isPublished, 
      show_as_popup: showAsPopup,
      image_url: imageUrls[0] || null,
      image_urls: imageUrls,
      attachment_url: attachmentUrl,
      attachment_name: attachmentName,
    });
  };

  // Render preview with inline images
  const renderPreview = () => {
    const parts = content.split(/(\[IMG:\d+(?::\d+)?(?::(?:left|center|right))?\])/g);
    
    return parts.map((part, idx) => {
      const match = part.match(/\[IMG:(\d+)(?::(\d+))?(?::(left|center|right))?\]/);
      if (match) {
        const imgIndex = parseInt(match[1], 10);
        const width = match[2] ? parseInt(match[2], 10) : 400;
        const alignment = (match[3] as ImageAlignment) || 'left';
        const imageUrl = imageUrls[imgIndex];
        if (imageUrl) {
          return (
            <ResizableImage
              key={idx}
              src={imageUrl}
              index={imgIndex}
              initialWidth={width}
              initialAlignment={alignment}
              onResize={handleImageResize}
              onAlignmentChange={handleImageAlignmentChange}
              onRemove={removeInlineImage}
            />
          );
        }
        return null;
      }
      if (part.trim()) {
        return (
          <span key={idx} className="whitespace-pre-wrap">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{notice ? '공지사항 수정' : '공지사항 등록'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">제목</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="공지사항 제목을 입력하세요"
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">내용</Label>
              <div className="flex items-center gap-2">
                <input
                  ref={inlineImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInlineImageUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inlineImageInputRef.current?.click()}
                  disabled={isUploadingInline}
                  className="h-8 text-xs"
                >
                  {isUploadingInline ? (
                    <div className="flex items-center gap-1">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                      <span>업로드 중...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Icon icon="solar:gallery-add-bold" className="w-4 h-4" />
                      <span>본문에 이미지 삽입</span>
                    </div>
                  )}
                </Button>
                {usedIndices.size > 0 && (
                  <Button
                    type="button"
                    variant={showPreview ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowPreview(!showPreview)}
                    className="h-8 text-xs"
                  >
                    <Icon icon={showPreview ? "solar:code-bold" : "solar:eye-bold"} className="w-4 h-4 mr-1" />
                    {showPreview ? '편집' : '미리보기'}
                  </Button>
                )}
              </div>
            </div>
            
            {showPreview ? (
              <div className="min-h-[200px] p-4 border rounded-md bg-muted/30">
                <p className="text-xs text-muted-foreground mb-3">
                  <Icon icon="solar:info-circle-linear" className="w-3.5 h-3.5 inline mr-1" />
                  이미지 모서리를 드래그하여 크기를 조절하세요
                </p>
                <div className="prose prose-sm max-w-none">
                  {renderPreview()}
                </div>
              </div>
            ) : (
              <>
                <Textarea
                  ref={textareaRef}
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="공지사항 내용을 입력하세요&#10;&#10;본문에 이미지를 삽입하려면 '본문에 이미지 삽입' 버튼을 클릭하세요."
                  rows={8}
                  required
                />
                {content.includes('[IMG:') && (
                  <p className="text-xs text-muted-foreground">
                    <Icon icon="solar:info-circle-linear" className="w-3.5 h-3.5 inline mr-1" />
                    &apos;미리보기&apos; 버튼을 클릭하여 이미지 크기를 조절할 수 있습니다.
                  </p>
                )}
              </>
            )}
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>이미지 첨부 (여러 장 가능)</Label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img 
                      src={url} 
                      alt={`첨부 이미지 ${index + 1}`} 
                      className="w-full h-full object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Icon icon="solar:trash-bin-trash-bold" className="w-3 h-3" />
                    </button>
                    <span className="absolute bottom-1 left-1 text-xs bg-black/60 text-white px-1.5 py-0.5 rounded">
                      {index}
                    </span>
                    {usedIndices.has(index) && (
                      <span className="absolute top-1 left-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                        본문
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => imageInputRef.current?.click()}
              disabled={isUploadingImage}
              className="w-full h-16 border-dashed"
            >
              {isUploadingImage ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                  <span>업로드 중...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 text-muted-foreground">
                  <Icon icon="solar:gallery-add-bold" className="w-5 h-5" />
                  <span className="text-xs">{imageUrls.length > 0 ? '이미지 추가' : '이미지 업로드'}</span>
                </div>
              )}
            </Button>
          </div>

          {/* File Attachment Section */}
          <div className="space-y-2">
            <Label>파일 첨부</Label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
            {attachmentUrl ? (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <Icon icon="solar:file-bold" className="w-8 h-8 text-primary" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachmentName}</p>
                  <a 
                    href={attachmentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline"
                  >
                    파일 보기
                  </a>
                </div>
                <button
                  type="button"
                  onClick={removeAttachment}
                  className="p-1.5 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                >
                  <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile}
                className="w-full"
              >
                {isUploadingFile ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span>업로드 중...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon icon="solar:upload-bold" className="w-5 h-5" />
                    <span className="text-sm">파일 첨부 (최대 20MB)</span>
                  </div>
                )}
              </Button>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_published">공개 여부</Label>
            <Switch
              id="is_published"
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show_as_popup">메인 팝업으로 표시</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                활성화 시 메인 페이지에 팝업으로 표시됩니다
              </p>
            </div>
            <Switch
              id="show_as_popup"
              checked={showAsPopup}
              onCheckedChange={setShowAsPopup}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" disabled={loading || !title.trim() || !content.trim()}>
              {loading ? '저장 중...' : notice ? '수정' : '등록'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
