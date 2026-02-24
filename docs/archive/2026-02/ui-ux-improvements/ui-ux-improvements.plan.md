# UI/UX 개선 계획서

> **Feature**: UI/UX Improvements
> **Phase**: Plan
> **Created**: 2026-02-24
> **Updated**: 2026-02-24
> **Status**: Draft

---

## 1. 현재 상태 분석

### 1.1 잘 구현된 부분 ✅

| 영역 | 현재 상태 | 평가 |
|------|----------|------|
| **색상 시스템** | OKLCH 기반 디자인 토큰 | 우수 - 일관성 있음 |
| **다크 모드** | 완전한 색상 역전 시스템 | 우수 |
| **애니메이션** | Framer Motion 기반 부드러운 전환 | 우수 |
| **반응형 디자인** | 모바일~데스크탑 최적화 | 양호 |
| **접근성** | ARIA, 키보드 네비게이션 | 양호 |
| **컴포넌트 시스템** | Radix UI + CVA 기반 | 우수 |
| **컨테이너 구조** | `container mx-auto px-4` 일관성 | 우수 |
| **섹션 패딩** | `section-padding` 유틸리티 (py-20 md:py-28) | 우수 |
| **버튼 크기** | `py-6` (48px+ 터치 영역) | 우수 |
| **캐러셀 화살표** | `w-12 h-12` (48px 터치 친화) | 우수 |

### 1.2 개선이 필요한 부분 ⚠️

| 영역 | 현재 문제 | 우선순위 |
|------|----------|----------|
| **Hero 섹션** | 배경 이미지 없음, 정적인 느낌 | 높음 |
| **Space 섹션** | 실제 이미지 없음 (플레이스홀더) | 높음 |
| **로딩 상태** | 스켈레톤 UI 부재 | 중간 |
| **마이크로인터랙션** | 호버/클릭 피드백 부족 | 중간 |
| **Footer 터치 영역** | 소셜 링크 36px (권장 44px 미만) | **높음** |
| **폼 에러 메시지** | text-xs (12px) 가독성 부족 | **높음** |
| **Gap 불일관** | gap-2, gap-3, gap-4 혼용 | 중간 |
| **모바일 UX** | 터치 피드백 부재, 하단 CTA 없음 | 중간 |

---

## 2. 여백(Spacing) 상세 분석

### 2.1 섹션별 Padding 현황

| 섹션 | Vertical Padding | Horizontal Padding | 상태 |
|------|------------------|-------------------|------|
| **Header** | py-3~py-4 | px-4 lg:px-8 | ✅ 적절 |
| **HeroSection** | pt-28 pb-16 | px-4 | ⚠️ pt 검토 필요 |
| **SpaceSection** | py-20 md:py-28 | px-4 | ✅ 적절 |
| **SystemSection** | py-20 md:py-28 | px-4 | ✅ 적절 |
| **ProgramSection** | py-20 md:py-28 | px-4 | ✅ 적절 |
| **ContactSection** | py-20 md:py-28 | px-4 | ✅ 적절 |
| **Footer** | py-12 lg:py-16 | px-4 | ✅ 적절 |

### 2.2 내부 여백 상세 (섹션 헤더)

| 섹션 | 헤더 mb | 배지 mb | 제목 mb | 설명 mb | 일관성 |
|------|---------|---------|---------|---------|--------|
| Hero | - | 10 | 8 | 14 | - |
| Space | 14 | 6 | 5 | - | ✅ |
| System | 14 | 6 | 5 | - | ✅ |
| Program | 14 | 6 | 4 | 8 | ✅ |
| Contact | **16** | - | 5 | - | ⚠️ 불일치 |

**문제점**: ContactSection의 `mb-16`이 다른 섹션의 `mb-14`와 불일치

### 2.3 Gap 사용 현황

| 위치 | 현재 Gap | 용도 | 권장 |
|------|----------|------|------|
| Footer 그리드 | gap-10 lg:gap-8 | 컬럼 간격 | ✅ 적절 |
| System 카드 | gap-6 | 카드 간격 | ✅ 적절 |
| Program 정보 | gap-4 | 항목 간격 | ✅ 적절 |
| Space 썸네일 | gap-3 | 썸네일 간격 | ✅ 적절 |
| Footer 소셜 | gap-2 | 아이콘 간격 | ⚠️ gap-3 권장 |
| 버튼 그룹 | gap-4 | 버튼 간격 | ✅ 적절 |
| 배지 아이콘 | gap-2 | 아이콘+텍스트 | ✅ 적절 |

### 2.4 개선 필요 여백

```
수정 필요:
1. ContactSection mb-16 → mb-14 (일관성)
2. Footer 소셜 gap-2 → gap-3 (터치 영역)
3. Hero pt-28 검증 (Header 높이 ~80px 대비)
```

---

## 3. 모바일 반응형 분석

### 3.1 브레이크포인트 사용 현황

| 브레이크포인트 | 크기 | 주요 변화 |
|----------------|------|----------|
| 기본 (모바일) | 0-639px | 1열 레이아웃, 수직 스택 |
| **sm** | 640px+ | 버튼 가로 정렬, 일부 그리드 |
| **md** | 768px+ | 2열 그리드, 폼 2열 |
| **lg** | 1024px+ | 4열 그리드, 데스크톱 네비 |
| xl | 1280px+ | 최대 컨테이너 너비 |

### 3.2 모바일 문제점 상세

#### 3.2.1 터치 영역 문제 (WCAG 44x44px 권장)

| 요소 | 현재 크기 | 권장 크기 | 상태 |
|------|----------|----------|------|
| Footer 소셜 링크 | w-9 h-9 (36px) | w-10 h-10 (40px) | ❌ 수정 필요 |
| Footer 아이콘 박스 | w-7 h-7 (28px) | w-8 h-8 (32px) | ❌ 수정 필요 |
| Header 햄버거 | p-2 + w-6 (40px) | - | ✅ 적절 |
| Space 화살표 | w-12 h-12 (48px) | - | ✅ 우수 |
| 폼 입력 필드 | py-6 (48px+) | - | ✅ 우수 |
| Space 썸네일 | w-20 h-14 (80x56) | - | ✅ 적절 |

#### 3.2.2 텍스트 가독성 문제

| 요소 | 현재 크기 | 권장 크기 | 상태 |
|------|----------|----------|------|
| 폼 에러 메시지 | text-xs (12px) | text-sm (14px) | ❌ 수정 필요 |
| Footer 하단 정보 | text-xs (12px) | - | ⚠️ 검토 필요 |
| 모바일 메뉴 링크 | text-sm (14px) | text-base (16px) | ⚠️ 권장 |

#### 3.2.3 레이아웃 문제

| 섹션 | 문제 | 해결 방안 |
|------|------|----------|
| Contact 체크박스 | sm에서 가로 정렬 (좁음) | md:flex-row로 변경 |
| Program 버튼 | sm에서 가로 정렬 | 적절, 유지 |
| Hero 통계 | 3열 유지 (gap-4) | gap-2 sm:gap-4 md:gap-12 |

### 3.3 모바일 최적화 체크리스트

```
긴급 수정 필요:
□ Footer 소셜 링크 w-9 → w-10
□ Footer 아이콘 박스 w-7 → w-8
□ 폼 에러 text-xs → text-sm
□ Contact 체크박스 sm:flex-row → md:flex-row

권장 개선:
□ 모바일 하단 고정 CTA 추가
□ 모바일 메뉴 폰트 크기 증가
□ 터치 리플 효과 추가
□ 스와이프 네비게이션 (Space)
```

---

## 4. 개선 목표

### 4.1 긴급 수정 (즉시)

1. **터치 영역 확대**
   - Footer 소셜 링크: `w-9 h-9` → `w-10 h-10`
   - Footer 아이콘 박스: `w-7 h-7` → `w-8 h-8`

2. **텍스트 가독성 개선**
   - 폼 에러 메시지: `text-xs` → `text-sm`
   - 모바일 메뉴: `text-sm` → `text-base`

3. **여백 일관성**
   - ContactSection 헤더: `mb-16` → `mb-14`

### 4.2 단기 목표 (1주)

1. **Hero 섹션 시각적 임팩트 강화**
   - 동적 배경 효과 추가 (파티클, 그래디언트 애니메이션)
   - 타이핑 애니메이션 효과

2. **로딩 경험 개선**
   - 스켈레톤 UI 컴포넌트 구현
   - 이미지 지연 로딩 최적화

3. **마이크로인터랙션 추가**
   - 버튼 클릭 리플 효과
   - 카드 호버 시 3D 틸트 효과

### 4.3 중기 목표 (2주)

1. **모바일 최적화**
   - 터치 제스처 지원 (스와이프)
   - 하단 고정 CTA 버튼
   - 터치 리플 피드백

2. **공간 섹션 리디자인**
   - 이미지 갤러리 라이트박스
   - 360도 가상 투어 연동 준비

3. **스크롤 기반 애니메이션**
   - 패럴랙스 효과
   - 스크롤 진행률 표시

---

## 5. 상세 개선 사항

### 5.1 Footer 터치 영역 수정

**현재 코드:**
```tsx
// 소셜 링크
className="w-9 h-9 rounded-lg bg-surface-dark/60"

// 연락처 아이콘
className="w-7 h-7 rounded-md bg-surface-dark/60"
```

**수정 코드:**
```tsx
// 소셜 링크
className="w-10 h-10 rounded-lg bg-surface-dark/60"

// 연락처 아이콘
className="w-8 h-8 rounded-md bg-surface-dark/60"
```

### 5.2 폼 에러 메시지 수정

**현재:**
```tsx
<p className="text-red-500 text-xs mt-1">
```

**수정:**
```tsx
<p className="text-destructive text-sm mt-1.5">
```

### 5.3 모바일 하단 CTA 추가

```tsx
// src/components/MobileFloatingCTA.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export function MobileFloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Hero 섹션 지나면 표시
      setIsVisible(window.scrollY > window.innerHeight * 0.5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-0 left-0 right-0 p-4
                     bg-surface-dark/95 backdrop-blur-lg
                     border-t border-border/50
                     md:hidden z-40 safe-area-bottom"
        >
          <Button
            className="w-full"
            size="xl"
            variant="gradient"
            onClick={() => {
              document.getElementById('contact')?.scrollIntoView({
                behavior: 'smooth'
              });
            }}
          >
            상담 신청하기
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 5.4 Hero 섹션 개선

**현재:**
```
- 정적인 다크 그래디언트 배경
- 텍스트만 표시
- 글로우 블롭 데코레이션
```

**개선안:**
```
- 동적 파티클 배경 (선택적)
- 타이핑 애니메이션 헤드라인
- 부유하는 3D 오브젝트 요소
- 스크롤 시 패럴랙스 효과
```

**구현 방법:**
- `tsparticles` 또는 CSS 기반 파티클
- `react-type-animation` 라이브러리
- Framer Motion `useScroll` + `useTransform`

### 5.5 스켈레톤 UI 시스템

**필요한 컴포넌트:**
```
├── Skeleton (기본)
├── SkeletonText (텍스트)
├── SkeletonCard (카드)
├── SkeletonImage (이미지)
└── SkeletonTable (테이블)
```

**디자인:**
```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    oklch(from var(--color-muted) l c h / 0.5) 0%,
    oklch(from var(--color-muted) l c h / 0.8) 50%,
    oklch(from var(--color-muted) l c h / 0.5) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 5.6 카드 인터랙션 개선

**현재:**
```css
.hover-lift {
  transform: translateY(-4px);
}
```

**개선안:**
```css
/* 3D 틸트 효과 */
.card-tilt {
  transform: perspective(1000px) rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform 0.1s ease-out;
}

/* 리플 효과 */
.ripple-effect {
  position: relative;
  overflow: hidden;
}
```

### 5.7 스크롤 기반 효과

```tsx
// 패럴랙스 배경
const { scrollYProgress } = useScroll();
const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

// 스크롤 진행률 표시
<motion.div
  className="fixed top-0 left-0 right-0 h-1 bg-primary origin-left z-50"
  style={{ scaleX: scrollYProgress }}
/>
```

---

## 6. 기술 스택 추가

| 패키지 | 용도 | 우선순위 |
|--------|------|----------|
| `react-type-animation` | 타이핑 효과 | 높음 |
| `react-intersection-observer` | 뷰포트 감지 | 높음 |
| `embla-carousel-react` | 향상된 카로셀 (터치 지원) | 중간 |
| `@react-spring/parallax` | 패럴랙스 (선택) | 낮음 |

---

## 7. 파일 변경 계획

### 7.1 즉시 수정할 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/components/Footer.tsx` | 터치 영역 확대 (w-9→w-10, w-7→w-8) |
| `src/components/ContactSection.tsx` | 에러 메시지 크기 (text-xs→text-sm), 체크박스 레이아웃 |

### 7.2 새로 생성할 파일

| 파일 | 설명 |
|------|------|
| `src/components/ui/skeleton.tsx` | 스켈레톤 UI 컴포넌트 |
| `src/components/ui/ripple.tsx` | 리플 효과 컴포넌트 |
| `src/components/MobileFloatingCTA.tsx` | 모바일 하단 CTA |
| `src/components/ScrollProgress.tsx` | 스크롤 진행률 표시 |
| `src/hooks/useTilt.ts` | 3D 틸트 커스텀 훅 |

### 7.3 수정할 파일

| 파일 | 변경 내용 |
|------|----------|
| `src/components/HeroSection.tsx` | 타이핑 애니메이션, 향상된 배경 |
| `src/components/SystemSection.tsx` | 카드 틸트 효과 |
| `src/components/SpaceSection.tsx` | 터치 스와이프, 썸네일 개선 |
| `src/app/globals.css` | 스켈레톤, 리플 유틸리티, safe-area |
| `src/app/layout.tsx` | ScrollProgress, MobileFloatingCTA 추가 |

---

## 8. 구현 우선순위

### Phase 0: 긴급 수정 (최우선)
1. ⬜ Footer 터치 영역 확대
2. ⬜ 폼 에러 메시지 가독성 개선
3. ⬜ ContactSection 여백 일관성

### Phase 1: 기본 UX 개선 (높은 우선순위)
4. ⬜ 스켈레톤 UI 컴포넌트
5. ⬜ Hero 타이핑 애니메이션
6. ⬜ 버튼 리플 효과

### Phase 2: 모바일 최적화 (중간 우선순위)
7. ⬜ 모바일 하단 CTA
8. ⬜ 터치 스와이프 (Space)
9. ⬜ 스크롤 진행률 표시

### Phase 3: 인터랙션 강화 (중간 우선순위)
10. ⬜ 카드 3D 틸트 효과
11. ⬜ 패럴랙스 배경

### Phase 4: 고급 효과 (낮은 우선순위)
12. ⬜ 파티클 배경 (선택)
13. ⬜ 360도 가상 투어 연동

---

## 9. 성공 지표

| 지표 | 현재 | 목표 |
|------|------|------|
| LCP (Largest Contentful Paint) | 측정 필요 | < 2.5s |
| CLS (Cumulative Layout Shift) | 측정 필요 | < 0.1 |
| 모바일 사용성 점수 (Lighthouse) | 측정 필요 | > 90 |
| 터치 타겟 크기 준수율 | ~70% | 100% |
| 사용자 체류 시간 | 측정 필요 | +20% |

---

## 10. 리스크 및 고려사항

| 리스크 | 완화 방안 |
|--------|----------|
| 애니메이션 과다로 성능 저하 | `will-change`, GPU 가속 최적화 |
| 번들 사이즈 증가 | 동적 임포트, 트리쉐이킹 |
| 접근성 저하 | `prefers-reduced-motion` 지원 |
| 구형 브라우저 미지원 | Progressive Enhancement |
| 모바일 Safe Area 미대응 | `safe-area-inset-*` CSS 적용 |

---

## 11. 다음 단계

1. **Plan 승인** 후 Phase 0 긴급 수정 즉시 진행
2. `/pdca design ui-ux-improvements` 실행하여 상세 디자인 명세 작성
3. 컴포넌트별 구현 진행

---

> **작성자**: Claude AI
> **검토자**: -
> **승인일**: -
