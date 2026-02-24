# Design: Admin CMS Fix - 비개발자용 콘텐츠 관리 시스템 개선

> Plan 문서 기반 상세 기술 설계

## 1. 설계 개요

### 1.1 목표 요약
- 어드민에서 콘텐츠 저장 시 **즉시** 메인 페이지에 반영
- 비개발자도 쉽게 사용할 수 있는 직관적인 UI/UX
- 저장 상태 명확화 및 실수 방지

### 1.2 설계 범위
```
Phase 1: Critical - 즉시 반영 문제 해결
Phase 2-A: Core UX - 비개발자 필수 기능
Phase 2-B: Enhanced UX - 편의 기능
```

---

## 2. Phase 1: 즉시 반영 문제 해결

### 2.1 캐시 전략 수정

#### 수정 파일: `src/hooks/usePageSections.ts`

**Before:**
```typescript
export function usePageSection(sectionKey: string) {
  return useQuery({
    queryKey: ['page-sections', sectionKey],
    queryFn: async () => { ... },
    staleTime: 1000 * 60 * 5, // 5분 캐시 ❌ 문제
  });
}
```

**After:**
```typescript
export function usePageSection(sectionKey: string) {
  return useQuery({
    queryKey: ['page-sections', sectionKey],
    queryFn: async () => { ... },
    staleTime: 0, // 항상 최신 데이터 ✅
    refetchOnWindowFocus: true, // 탭 포커스 시 자동 갱신
  });
}
```

#### 수정 대상 전체 hooks:

| 파일 | 함수 | 현재 staleTime | 변경 |
|------|------|----------------|------|
| `usePageSections.ts` | `usePageSection` | 5분 | **0** |
| `useHeroStats.ts` | `useHeroStats` | 5분 | **0** |
| `useSpaceSlides.ts` | `useSpaceSlides` | 5분 | **0** |
| `useSystemCards.ts` | `useSystemCards` | 5분 | **0** |
| `useOperatingHours.ts` | `useOperatingHours` | 5분 | **0** |

### 2.2 Query Invalidation 강화

#### 수정 파일: `src/hooks/usePageSections.ts`

**Before:**
```typescript
onSuccess: (_, variables) => {
  queryClient.invalidateQueries({
    queryKey: ['page-sections', variables.sectionKey]
  });
  queryClient.invalidateQueries({
    queryKey: ['page-sections-admin', variables.sectionKey]
  });
  toast.success('저장되었습니다');
}
```

**After:**
```typescript
onSuccess: (_, variables) => {
  // 모든 관련 쿼리 무효화
  queryClient.invalidateQueries({
    queryKey: ['page-sections']  // 전체 무효화
  });
  // 강제 refetch
  queryClient.refetchQueries({
    queryKey: ['page-sections', variables.sectionKey],
    type: 'active'
  });
  toast.success('저장 완료! 메인 페이지에 반영되었습니다.', {
    description: '새로고침 없이 바로 확인 가능합니다.'
  });
}
```

---

## 3. Phase 2-A: Core UX (비개발자 필수)

### 3.1 저장 상태 개선

#### 새 컴포넌트: `src/components/admin/SaveStatusIndicator.tsx`

```typescript
interface SaveStatusIndicatorProps {
  hasChanges: boolean;
  isPending: boolean;
  lastSavedAt: Date | null;
}

export function SaveStatusIndicator({
  hasChanges,
  isPending,
  lastSavedAt
}: SaveStatusIndicatorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {isPending && (
        <span className="flex items-center gap-1 text-amber-500">
          <Loader2 className="w-3 h-3 animate-spin" />
          저장 중...
        </span>
      )}
      {hasChanges && !isPending && (
        <span className="flex items-center gap-1 text-amber-500">
          <Circle className="w-2 h-2 fill-current" />
          저장되지 않은 변경사항
        </span>
      )}
      {!hasChanges && !isPending && lastSavedAt && (
        <span className="text-muted-foreground">
          마지막 저장: {formatRelativeTime(lastSavedAt)}
        </span>
      )}
    </div>
  );
}
```

### 3.2 미저장 변경사항 경고

#### 새 훅: `src/hooks/useUnsavedChangesWarning.ts`

```typescript
export function useUnsavedChangesWarning(hasChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = '저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);
}
```

#### Editor에 적용:

```typescript
// HeroSectionEditor.tsx
export function HeroSectionEditor() {
  const [hasChanges, setHasChanges] = useState(false);

  // 미저장 경고 활성화
  useUnsavedChangesWarning(hasChanges);

  // ... 기존 코드
}
```

### 3.3 탭 전환 경고

#### 수정 파일: `src/components/admin/PageContentTab.tsx`

```typescript
const [activeTab, setActiveTab] = useState('hero');
const [pendingTab, setPendingTab] = useState<string | null>(null);
const [showWarning, setShowWarning] = useState(false);

const handleTabChange = (newTab: string) => {
  if (hasUnsavedChanges) {
    setPendingTab(newTab);
    setShowWarning(true);
  } else {
    setActiveTab(newTab);
  }
};

// 경고 다이얼로그
<AlertDialog open={showWarning} onOpenChange={setShowWarning}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>저장되지 않은 변경사항</AlertDialogTitle>
      <AlertDialogDescription>
        변경사항을 저장하지 않고 이동하시겠습니까?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>취소</AlertDialogCancel>
      <AlertDialogAction onClick={() => {
        setActiveTab(pendingTab!);
        setPendingTab(null);
        setShowWarning(false);
      }}>
        저장 안 함
      </AlertDialogAction>
      <Button onClick={handleSaveAndMove}>
        저장 후 이동
      </Button>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 3.4 "원래대로" 버튼

#### Editor 수정:

```typescript
// 원본 데이터 저장
const [originalValues, setOriginalValues] = useState<Record<string, string>>({});

useEffect(() => {
  if (fields) {
    const values: Record<string, string> = {};
    fields.forEach(f => {
      values[f.field_key] = f.content;
    });
    setFormValues(values);
    setOriginalValues(values); // 원본 저장
  }
}, [fields]);

// 원래대로 복원 함수
const handleReset = () => {
  setFormValues(originalValues);
  setHasChanges(false);
  toast.info('원래 값으로 복원되었습니다');
};

// UI
<div className="flex gap-2">
  <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
    <RotateCcw className="w-4 h-4 mr-2" />
    원래대로
  </Button>
  <Button onClick={handleSave} disabled={!hasChanges || isPending}>
    <Save className="w-4 h-4 mr-2" />
    저장
  </Button>
</div>
```

### 3.5 문자 수 카운터

#### 새 컴포넌트: `src/components/admin/CharacterCounter.tsx`

```typescript
interface CharacterCounterProps {
  current: number;
  max?: number;
  warn?: number; // 경고 시작 글자수
}

export function CharacterCounter({ current, max, warn }: CharacterCounterProps) {
  const percentage = max ? (current / max) * 100 : 0;
  const isWarning = warn && current >= warn;
  const isOver = max && current > max;

  return (
    <span className={cn(
      "text-xs",
      isOver ? "text-destructive font-medium" :
      isWarning ? "text-amber-500" :
      "text-muted-foreground"
    )}>
      {current}{max && `/${max}`}자
    </span>
  );
}
```

#### 사용 예:

```typescript
<div>
  <div className="flex items-center justify-between">
    <Label>메인 헤드라인</Label>
    <CharacterCounter current={value.length} max={50} warn={40} />
  </div>
  <Input
    value={value}
    onChange={(e) => setValue(e.target.value)}
    maxLength={50}
  />
</div>
```

---

## 4. Phase 2-B: Enhanced UX (편의 기능)

### 4.1 툴팁/도움말

#### 새 컴포넌트: `src/components/admin/FieldHelp.tsx`

```typescript
interface FieldHelpProps {
  children: React.ReactNode;
  description: string;
  location?: string; // 표시 위치 설명
}

export function FieldHelp({ children, description, location }: FieldHelpProps) {
  return (
    <div className="flex items-center gap-2">
      {children}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{description}</p>
            {location && (
              <p className="text-xs text-muted-foreground mt-1">
                표시 위치: {location}
              </p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
```

### 4.2 키보드 단축키

#### 새 훅: `src/hooks/useKeyboardShortcuts.ts`

```typescript
export function useKeyboardShortcuts(shortcuts: {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S: 저장
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        shortcuts.onSave?.();
      }
      // Ctrl/Cmd + Z: 되돌리기
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        shortcuts.onUndo?.();
      }
      // Ctrl/Cmd + Shift + Z: 다시 실행
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        shortcuts.onRedo?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
```

---

## 5. 파일 구조

### 새로 생성할 파일

```
src/
├── components/admin/
│   ├── SaveStatusIndicator.tsx    # 저장 상태 표시
│   ├── CharacterCounter.tsx       # 문자 수 카운터
│   └── FieldHelp.tsx              # 툴팁 도움말
├── hooks/
│   ├── useUnsavedChangesWarning.ts  # 미저장 경고
│   └── useKeyboardShortcuts.ts      # 키보드 단축키
```

### 수정할 파일

```
src/
├── hooks/
│   ├── usePageSections.ts    # staleTime, invalidation 수정
│   ├── useHeroStats.ts       # staleTime 수정
│   ├── useSpaceSlides.ts     # staleTime 수정
│   ├── useSystemCards.ts     # staleTime 수정
│   └── useOperatingHours.ts  # staleTime 수정
├── components/admin/
│   ├── HeroSectionEditor.tsx    # UX 기능 적용
│   ├── SpaceSectionEditor.tsx   # UX 기능 적용
│   ├── SystemSectionEditor.tsx  # UX 기능 적용
│   ├── ProgramSectionEditor.tsx # UX 기능 적용
│   └── PageContentTab.tsx       # 탭 전환 경고
```

---

## 6. 구현 순서

```
Step 1: 즉시 반영 (Critical)
├── 1.1 usePageSections.ts - staleTime: 0
├── 1.2 useHeroStats.ts - staleTime: 0
├── 1.3 useSpaceSlides.ts - staleTime: 0
├── 1.4 useSystemCards.ts - staleTime: 0
├── 1.5 useOperatingHours.ts - staleTime: 0
├── 1.6 Query invalidation 강화
└── 1.7 테스트

Step 2: Core UX
├── 2.1 SaveStatusIndicator.tsx 생성
├── 2.2 useUnsavedChangesWarning.ts 생성
├── 2.3 HeroSectionEditor에 적용
├── 2.4 다른 Editor들에 적용
├── 2.5 CharacterCounter.tsx 생성
└── 2.6 테스트

Step 3: Enhanced UX
├── 3.1 FieldHelp.tsx 생성
├── 3.2 useKeyboardShortcuts.ts 생성
├── 3.3 Editor들에 적용
└── 3.4 최종 테스트
```

---

## 7. 테스트 시나리오

### TC-01: 즉시 반영 테스트
1. 어드민에서 Hero badge 수정
2. 저장 클릭
3. 새 탭에서 메인 페이지 열기
4. **Expected**: 변경된 badge 즉시 표시

### TC-02: 미저장 경고 테스트
1. Hero headline 수정 (저장 안함)
2. 브라우저 탭 닫기 시도
3. **Expected**: 경고 팝업 표시

### TC-03: 탭 전환 경고 테스트
1. Hero section 수정 (저장 안함)
2. Space 탭 클릭
3. **Expected**: 경고 다이얼로그 표시

### TC-04: 원래대로 테스트
1. Hero headline 수정
2. "원래대로" 버튼 클릭
3. **Expected**: DB 저장 값으로 복원

### TC-05: Ctrl+S 저장 테스트
1. Hero description 수정
2. Ctrl+S 입력
3. **Expected**: 저장 실행

---

## 8. 예상 결과

| 지표 | Before | After |
|------|--------|-------|
| 콘텐츠 반영 시간 | ~5분 | **즉시** |
| 미저장 데이터 유실 | 가능 | **불가능** |
| 비개발자 학습 시간 | 30분+ | **10분 이내** |

---

**작성일**: 2026-02-24
**Feature**: admin-cms-fix
**Phase**: Design
**Blocked By**: Plan 완료
**Status**: Ready for Implementation
