import { useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';

export type ImageAlignment = 'left' | 'center' | 'right';

interface ResizableImageProps {
  src: string;
  index: number;
  initialWidth?: number;
  initialAlignment?: ImageAlignment;
  onResize: (index: number, width: number) => void;
  onAlignmentChange: (index: number, alignment: ImageAlignment) => void;
  onRemove: (index: number) => void;
}

export default function ResizableImage({ 
  src, 
  index, 
  initialWidth = 400,
  initialAlignment = 'left',
  onResize,
  onAlignmentChange,
  onRemove 
}: ResizableImageProps) {
  const [width, setWidth] = useState(initialWidth);
  const [alignment, setAlignment] = useState<ImageAlignment>(initialAlignment);
  const [isResizing, setIsResizing] = useState(false);
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const imgElementRef = useRef<HTMLImageElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    setWidth(initialWidth);
  }, [initialWidth]);

  useEffect(() => {
    setAlignment(initialAlignment);
  }, [initialAlignment]);

  const handleImageLoad = () => {
    if (imgElementRef.current) {
      const { naturalWidth, naturalHeight } = imgElementRef.current;
      if (naturalWidth && naturalHeight) {
        setAspectRatio(naturalWidth / naturalHeight);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
  };

  const handleAlignmentClick = (newAlignment: ImageAlignment) => {
    setAlignment(newAlignment);
    onAlignmentChange(index, newAlignment);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const diff = e.clientX - startXRef.current;
      const newWidth = Math.max(100, Math.min(800, startWidthRef.current + diff));
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        onResize(index, width);
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, width, index, onResize]);

  const calculatedHeight = aspectRatio ? width / aspectRatio : undefined;

  const alignmentClass = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto'
  }[alignment];

  return (
    <div 
      ref={imageRef}
      className={`relative group my-2 ${alignmentClass}`}
      style={{ width: `${width}px` }}
    >
      <img 
        ref={imgElementRef}
        src={src} 
        alt={`본문 이미지 ${index + 1}`}
        className="w-full rounded-lg border border-border"
        style={{ height: calculatedHeight ? `${calculatedHeight}px` : 'auto' }}
        draggable={false}
        onLoad={handleImageLoad}
      />
      
      {/* Alignment buttons */}
      <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          type="button"
          onClick={() => handleAlignmentClick('left')}
          className={`p-1.5 rounded-full transition-colors ${
            alignment === 'left' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-black/60 text-white hover:bg-black/80'
          }`}
          title="왼쪽 정렬"
        >
          <Icon icon="solar:align-left-bold" className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleAlignmentClick('center')}
          className={`p-1.5 rounded-full transition-colors ${
            alignment === 'center' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-black/60 text-white hover:bg-black/80'
          }`}
          title="가운데 정렬"
        >
          <Icon icon="solar:align-horizontal-center-bold" className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => handleAlignmentClick('right')}
          className={`p-1.5 rounded-full transition-colors ${
            alignment === 'right' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-black/60 text-white hover:bg-black/80'
          }`}
          title="오른쪽 정렬"
        >
          <Icon icon="solar:align-right-bold" className="w-4 h-4" />
        </button>
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <Icon icon="solar:trash-bin-trash-bold" className="w-4 h-4" />
      </button>

      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-center justify-center bg-primary/80 rounded-tl-lg rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Icon icon="solar:scaling-bold" className="w-4 h-4 text-white" />
      </div>

      {/* Width indicator */}
      {isResizing && (
        <div className="absolute bottom-8 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {Math.round(width)}px
        </div>
      )}

      {/* Image index badge */}
      <span className="absolute bottom-2 left-2 text-xs bg-black/60 text-white px-2 py-0.5 rounded">
        {index + 1}
      </span>
    </div>
  );
}
