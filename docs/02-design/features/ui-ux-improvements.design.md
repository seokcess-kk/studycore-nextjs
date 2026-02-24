# UI/UX 개선 설계서

> **Feature**: UI/UX Improvements
> **Phase**: Design
> **Created**: 2026-02-24
> **Plan Reference**: `docs/01-plan/features/ui-ux-improvements.plan.md`
> **Status**: Draft

---

## 1. 설계 개요

### 1.1 목적
StudyCore 랜딩 페이지의 UI/UX를 개선하여 사용자 경험을 향상시키고, 모바일 접근성을 강화합니다.

### 1.2 범위
- Phase 0: 긴급 수정 (터치 영역, 가독성, 여백 일관성)
- Phase 1: 기본 UX 개선 (스켈레톤 UI, 타이핑 애니메이션, 리플 효과)
- Phase 2: 모바일 최적화 (하단 CTA, 스와이프, 스크롤 진행률)
- Phase 3: 인터랙션 강화 (카드 틸트, 패럴랙스)

---

## 2. Phase 0: 긴급 수정 상세 설계

### 2.1 Footer 터치 영역 확대

**파일**: `src/components/Footer.tsx`

#### 2.1.1 소셜 링크 수정

```tsx
// Before
className="w-9 h-9 rounded-lg bg-surface-dark/60 border border-border/50"

// After
className="w-10 h-10 rounded-lg bg-surface-dark/60 border border-border/50"
```

#### 2.1.2 연락처 아이콘 박스 수정

```tsx
// Before
className="w-7 h-7 rounded-md bg-surface-dark/60 border border-border/50"

// After
className="w-8 h-8 rounded-md bg-surface-dark/60 border border-border/50"
```

#### 2.1.3 소셜 링크 간격 수정

```tsx
// Before
<div className="flex gap-2">

// After
<div className="flex gap-3">
```

### 2.2 폼 에러 메시지 가독성 개선

**파일**: `src/components/ContactSection.tsx`

#### 2.2.1 에러 메시지 스타일

```tsx
// Before
<p className="text-red-500 text-xs mt-1 flex items-center gap-1">

// After
<p className="text-destructive text-sm mt-1.5 flex items-center gap-1">
```

#### 2.2.2 체크박스 레이아웃 수정

```tsx
// Before
className="flex flex-col sm:flex-row sm:items-center gap-4"

// After
className="flex flex-col md:flex-row md:items-center gap-4"
```

### 2.3 ContactSection 여백 일관성

**파일**: `src/components/ContactSection.tsx`

```tsx
// Before (섹션 헤더)
className="text-center mb-16"

// After
className="text-center mb-14"
```

---

## 3. Phase 1: 기본 UX 개선 상세 설계

### 3.1 스켈레톤 UI 컴포넌트

**파일**: `src/components/ui/skeleton.tsx`

#### 3.1.1 컴포넌트 구조

```tsx
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'circular' | 'text' | 'card';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = 'default',
  width,
  height,
  ...props
}: SkeletonProps) {
  const variants = {
    default: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
    card: 'rounded-2xl',
  };

  return (
    <div
      className={cn(
        'animate-shimmer bg-gradient-to-r',
        'from-muted/50 via-muted/80 to-muted/50',
        'bg-[length:200%_100%]',
        variants[variant],
        className
      )}
      style={{ width, height }}
      {...props}
    />
  );
}

// 프리셋 컴포넌트
export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={i === lines - 1 ? 'w-3/4' : 'w-full'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-6 rounded-2xl border border-border">
      <Skeleton variant="circular" className="w-14 h-14 mb-4" />
      <Skeleton variant="text" className="h-6 w-3/4 mb-2" />
      <Skeleton variant="text" className="h-4 w-1/2 mb-4" />
      <SkeletonText lines={2} />
    </div>
  );
}

export function SkeletonImage({ aspectRatio = '16/9' }: { aspectRatio?: string }) {
  return (
    <Skeleton
      variant="card"
      className="w-full"
      style={{ aspectRatio }}
    />
  );
}
```

#### 3.1.2 CSS 애니메이션 추가

**파일**: `src/app/globals.css`

```css
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

@theme {
  --animate-shimmer: shimmer 1.5s ease-in-out infinite;
}
```

### 3.2 Hero 타이핑 애니메이션

**파일**: `src/components/HeroSection.tsx`

#### 3.2.1 의존성 설치

```bash
npm install react-type-animation
```

#### 3.2.2 컴포넌트 수정

```tsx
import { TypeAnimation } from 'react-type-animation';

// headline_2 부분 수정
<TypeAnimation
  sequence={[
    content.headline_2 || '스터디코어 1.0',
    3000,
  ]}
  wrapper="span"
  speed={50}
  className="text-gradient"
  repeat={0}
/>
```

#### 3.2.3 Reduced Motion 지원

```tsx
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

{prefersReducedMotion ? (
  <span className="text-gradient">{content.headline_2}</span>
) : (
  <TypeAnimation ... />
)}
```

### 3.3 버튼 리플 효과

**파일**: `src/components/ui/ripple.tsx`

#### 3.3.1 리플 훅

```tsx
'use client';

import { useState, useCallback, MouseEvent } from 'react';

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export function useRipple() {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const createRipple = useCallback((event: MouseEvent<HTMLElement>) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height) * 2;
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    const newRipple: Ripple = {
      x,
      y,
      size,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);
  }, []);

  return { ripples, createRipple };
}
```

#### 3.3.2 리플 컴포넌트

```tsx
interface RippleContainerProps {
  ripples: Ripple[];
  color?: string;
}

export function RippleContainer({ ripples, color = 'white' }: RippleContainerProps) {
  return (
    <span className="absolute inset-0 overflow-hidden rounded-inherit pointer-events-none">
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ripple opacity-30"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
            backgroundColor: color,
          }}
        />
      ))}
    </span>
  );
}
```

#### 3.3.3 CSS 애니메이션

```css
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@theme {
  --animate-ripple: ripple 0.6s ease-out forwards;
}

@utility rounded-inherit {
  border-radius: inherit;
}
```

#### 3.3.4 Button 컴포넌트 통합

**파일**: `src/components/ui/button.tsx`

```tsx
import { useRipple, RippleContainer } from './ripple';

// Button 컴포넌트 내부
const { ripples, createRipple } = useRipple();

return (
  <Comp
    className={cn(buttonVariants({ variant, size, className }), 'relative overflow-hidden')}
    onMouseDown={createRipple}
    ref={ref}
    {...props}
  >
    {children}
    <RippleContainer ripples={ripples} />
  </Comp>
);
```

---

## 4. Phase 2: 모바일 최적화 상세 설계

### 4.1 모바일 하단 CTA

**파일**: `src/components/MobileFloatingCTA.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export function MobileFloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtContact, setIsAtContact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      const contactSection = document.getElementById('contact');

      // Hero 섹션 50% 지나면 표시
      setIsVisible(scrollY > heroHeight * 0.5);

      // Contact 섹션에 도달하면 숨김
      if (contactSection) {
        const contactTop = contactSection.offsetTop;
        setIsAtContact(scrollY + window.innerHeight > contactTop);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  // Contact 섹션에 있으면 표시 안함
  if (isAtContact) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden
                     p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]
                     bg-gradient-to-t from-surface-dark via-surface-dark/98 to-surface-dark/90
                     backdrop-blur-lg border-t border-border/30"
        >
          <Button
            onClick={scrollToContact}
            className="w-full"
            size="xl"
            variant="gradient"
          >
            <MessageSquare className="mr-2 h-5 w-5" />
            상담 신청하기
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 4.2 Safe Area CSS 추가

**파일**: `src/app/globals.css`

```css
@utility safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

@utility safe-area-top {
  padding-top: env(safe-area-inset-top);
}

/* 모바일 CTA가 있을 때 Footer 하단 여백 */
@media (max-width: 767px) {
  footer {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  }
}
```

### 4.3 Layout에 MobileFloatingCTA 추가

**파일**: `src/app/layout.tsx`

```tsx
import { MobileFloatingCTA } from '@/components/MobileFloatingCTA';

// body 내부, </body> 직전에 추가
<MobileFloatingCTA />
```

### 4.4 스크롤 진행률 표시

**파일**: `src/components/ScrollProgress.tsx`

```tsx
'use client';

import { motion, useScroll, useSpring } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r
                 from-primary via-brand-cyan to-primary
                 origin-left z-50"
      style={{ scaleX }}
    />
  );
}
```

### 4.5 Space 섹션 터치 스와이프

**파일**: `src/components/SpaceSection.tsx`

#### 4.5.1 터치 이벤트 핸들러 추가

```tsx
const [touchStart, setTouchStart] = useState<number | null>(null);
const [touchEnd, setTouchEnd] = useState<number | null>(null);

const minSwipeDistance = 50;

const onTouchStart = (e: React.TouchEvent) => {
  setTouchEnd(null);
  setTouchStart(e.targetTouches[0].clientX);
};

const onTouchMove = (e: React.TouchEvent) => {
  setTouchEnd(e.targetTouches[0].clientX);
};

const onTouchEnd = () => {
  if (!touchStart || !touchEnd) return;

  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > minSwipeDistance;
  const isRightSwipe = distance < -minSwipeDistance;

  if (isLeftSwipe) {
    goToNext();
  } else if (isRightSwipe) {
    goToPrevious();
  }
};
```

#### 4.5.2 캐러셀 컨테이너에 이벤트 바인딩

```tsx
<div
  className="relative max-w-6xl mx-auto"
  onTouchStart={onTouchStart}
  onTouchMove={onTouchMove}
  onTouchEnd={onTouchEnd}
>
  {/* 캐러셀 내용 */}
</div>
```

---

## 5. Phase 3: 인터랙션 강화 상세 설계

### 5.1 카드 3D 틸트 효과

**파일**: `src/hooks/useTilt.ts`

```tsx
'use client';

import { useState, useCallback, MouseEvent, RefObject } from 'react';

interface TiltState {
  rotateX: number;
  rotateY: number;
  scale: number;
}

interface UseTiltOptions {
  max?: number;
  scale?: number;
  speed?: number;
}

export function useTilt(
  ref: RefObject<HTMLElement>,
  options: UseTiltOptions = {}
) {
  const { max = 15, scale = 1.02, speed = 400 } = options;

  const [tilt, setTilt] = useState<TiltState>({
    rotateX: 0,
    rotateY: 0,
    scale: 1,
  });

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -max;
      const rotateY = ((x - centerX) / centerX) * max;

      setTilt({ rotateX, rotateY, scale });
    },
    [ref, max, scale]
  );

  const handleMouseLeave = useCallback(() => {
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
  }, []);

  const style = {
    transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
    transition: `transform ${speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`,
  };

  return {
    style,
    handlers: {
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}
```

### 5.2 SystemSection 카드에 틸트 적용

**파일**: `src/components/SystemSection.tsx`

```tsx
import { useTilt } from '@/hooks/useTilt';

function SystemCard({ card, index }: { card: SystemCard; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { style, handlers } = useTilt(cardRef, { max: 8, scale: 1.02 });

  // Reduced motion 체크
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <motion.div
      ref={cardRef}
      style={prefersReducedMotion ? {} : style}
      {...(prefersReducedMotion ? {} : handlers)}
      className="group relative bg-card rounded-2xl p-7 border border-border"
    >
      {/* 카드 내용 */}
    </motion.div>
  );
}
```

### 5.3 패럴랙스 배경 (Hero)

**파일**: `src/components/HeroSection.tsx`

```tsx
import { useScroll, useTransform, motion } from 'framer-motion';

export function HeroSection() {
  const { scrollY } = useScroll();

  // 패럴랙스 효과
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.3]);

  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* 배경 블롭 - 패럴랙스 */}
      <motion.div
        style={{ y: y1, opacity }}
        className="absolute top-1/4 left-1/4 w-96 h-96
                   bg-primary/20 rounded-full blur-[120px]"
      />
      <motion.div
        style={{ y: y2, opacity }}
        className="absolute top-1/3 right-1/4 w-80 h-80
                   bg-brand-cyan/15 rounded-full blur-[100px]"
      />

      {/* 콘텐츠 */}
      <div className="relative z-10">
        {/* ... */}
      </div>
    </section>
  );
}
```

---

## 6. 파일 변경 요약

### 6.1 수정할 파일

| 파일 | Phase | 변경 내용 |
|------|-------|----------|
| `src/components/Footer.tsx` | 0 | 터치 영역 확대 |
| `src/components/ContactSection.tsx` | 0 | 에러 메시지, 체크박스, 여백 |
| `src/components/HeroSection.tsx` | 1, 3 | 타이핑 애니메이션, 패럴랙스 |
| `src/components/SpaceSection.tsx` | 2 | 터치 스와이프 |
| `src/components/SystemSection.tsx` | 3 | 카드 틸트 효과 |
| `src/components/ui/button.tsx` | 1 | 리플 효과 통합 |
| `src/app/globals.css` | 1, 2 | 애니메이션, Safe Area |
| `src/app/layout.tsx` | 2 | MobileFloatingCTA, ScrollProgress |

### 6.2 새로 생성할 파일

| 파일 | Phase | 설명 |
|------|-------|------|
| `src/components/ui/skeleton.tsx` | 1 | 스켈레톤 UI |
| `src/components/ui/ripple.tsx` | 1 | 리플 효과 |
| `src/components/MobileFloatingCTA.tsx` | 2 | 모바일 하단 CTA |
| `src/components/ScrollProgress.tsx` | 2 | 스크롤 진행률 |
| `src/hooks/useTilt.ts` | 3 | 3D 틸트 훅 |
| `src/hooks/useMediaQuery.ts` | 3 | 미디어 쿼리 훅 |

### 6.3 의존성 추가

```json
{
  "dependencies": {
    "react-type-animation": "^3.2.0"
  }
}
```

---

## 7. 구현 순서 (Checklist)

### Phase 0: 긴급 수정
- [ ] 7.1 Footer.tsx - 소셜 링크 w-9→w-10
- [ ] 7.2 Footer.tsx - 아이콘 박스 w-7→w-8
- [ ] 7.3 Footer.tsx - 소셜 간격 gap-2→gap-3
- [ ] 7.4 ContactSection.tsx - 에러 메시지 text-sm
- [ ] 7.5 ContactSection.tsx - 체크박스 md:flex-row
- [ ] 7.6 ContactSection.tsx - 헤더 mb-14

### Phase 1: 기본 UX 개선
- [ ] 7.7 globals.css - shimmer, ripple 애니메이션
- [ ] 7.8 ui/skeleton.tsx 생성
- [ ] 7.9 ui/ripple.tsx 생성
- [ ] 7.10 react-type-animation 설치
- [ ] 7.11 HeroSection.tsx - 타이핑 애니메이션
- [ ] 7.12 button.tsx - 리플 효과 통합

### Phase 2: 모바일 최적화
- [ ] 7.13 MobileFloatingCTA.tsx 생성
- [ ] 7.14 ScrollProgress.tsx 생성
- [ ] 7.15 globals.css - Safe Area 유틸리티
- [ ] 7.16 layout.tsx - 컴포넌트 추가
- [ ] 7.17 SpaceSection.tsx - 터치 스와이프

### Phase 3: 인터랙션 강화
- [ ] 7.18 hooks/useTilt.ts 생성
- [ ] 7.19 hooks/useMediaQuery.ts 생성
- [ ] 7.20 SystemSection.tsx - 카드 틸트
- [ ] 7.21 HeroSection.tsx - 패럴랙스 배경

---

## 8. 테스트 시나리오

### 8.1 Phase 0 테스트

| 항목 | 테스트 방법 | 기대 결과 |
|------|------------|----------|
| Footer 터치 | 모바일에서 소셜 링크 탭 | 쉽게 탭 가능 (40px) |
| 에러 메시지 | 폼 유효성 실패 | 14px 크기로 가독성 향상 |
| 여백 일관성 | 섹션 헤더 간격 비교 | 모든 섹션 mb-14 |

### 8.2 Phase 1 테스트

| 항목 | 테스트 방법 | 기대 결과 |
|------|------------|----------|
| 스켈레톤 UI | 느린 네트워크 시뮬레이션 | 로딩 중 shimmer 애니메이션 |
| 타이핑 효과 | Hero 섹션 초기 로드 | 헤드라인 타이핑 애니메이션 |
| 리플 효과 | 버튼 클릭 | 클릭 위치에서 리플 확산 |

### 8.3 Phase 2 테스트

| 항목 | 테스트 방법 | 기대 결과 |
|------|------------|----------|
| 하단 CTA | 모바일 스크롤 | Hero 50% 지나면 표시 |
| CTA 숨김 | Contact 섹션 도달 | CTA 자동 숨김 |
| 스와이프 | Space 섹션 좌우 스와이프 | 슬라이드 전환 |
| Safe Area | iPhone 노치 영역 | 콘텐츠 가림 없음 |

### 8.4 접근성 테스트

| 항목 | 테스트 방법 | 기대 결과 |
|------|------------|----------|
| Reduced Motion | 시스템 설정 활성화 | 애니메이션 비활성화 |
| 키보드 네비게이션 | Tab 키로 이동 | Focus 상태 명확 |
| 스크린 리더 | VoiceOver/NVDA | 콘텐츠 올바르게 읽힘 |

---

## 9. 성능 고려사항

### 9.1 번들 크기

| 패키지 | 크기 | 최적화 방안 |
|--------|------|------------|
| react-type-animation | ~3KB | 동적 임포트 |
| framer-motion | 이미 사용 중 | - |

### 9.2 렌더링 최적화

```tsx
// 스크롤 이벤트 최적화
useEffect(() => {
  const handleScroll = () => { ... };
  window.addEventListener('scroll', handleScroll, { passive: true });
  return () => window.removeEventListener('scroll', handleScroll);
}, []);

// 틸트 효과 쓰로틀링
const handleMouseMove = useCallback(
  throttle((e: MouseEvent) => { ... }, 16), // 60fps
  []
);
```

### 9.3 GPU 가속

```css
/* 애니메이션 요소에 적용 */
.will-change-transform {
  will-change: transform;
}

.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

---

## 10. 다음 단계

1. Design 문서 승인 후 `/pdca do ui-ux-improvements` 실행
2. Phase 0 긴급 수정부터 순차적 구현
3. 각 Phase 완료 후 테스트 진행
4. `/pdca analyze ui-ux-improvements`로 Gap 분석

---

> **작성자**: Claude AI
> **검토자**: -
> **승인일**: -
