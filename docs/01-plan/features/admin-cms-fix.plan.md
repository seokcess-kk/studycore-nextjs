# Plan: Admin CMS Fix - 비개발자용 콘텐츠 관리 시스템 개선

> 어드민 페이지에서 메인 페이지 내용 수정이 즉시 반영되도록 CMS 시스템 개선

## 1. 문제 정의

### 현재 상황
- 어드민 페이지에서 콘텐츠 수정 후 저장해도 메인 페이지에 **즉시 반영되지 않음**
- 비개발자가 홈페이지 내용을 쉽게 변경할 수 있어야 하는데, 변경이 적용되지 않아 혼란 발생
- 관리자가 저장 성공 토스트를 보지만 실제 페이지에서는 구버전이 보임

### 근본 원인 (분석 결과)

| 원인 | 심각도 | 설명 |
|------|--------|------|
| **캐시 staleTime 5분** | Critical | `usePageSection()` hook의 staleTime이 5분으로 설정되어 저장 후에도 refetch하지 않음 |
| **Fallback defaults** | High | DB 쿼리 실패 시 `section-defaults.ts`의 기본값을 보여줌 → 에러가 숨겨짐 |
| **Query 무효화 불일치** | High | admin과 public query key가 다르면 invalidation이 작동하지 않을 수 있음 |
| **실시간 동기화 없음** | Medium | 저장 후 페이지 새로고침 없이는 변경사항이 보이지 않음 |

## 2. 목표

### Primary Goals (필수)
- [ ] 어드민에서 콘텐츠 저장 시 **즉시** 메인 페이지에 반영
- [ ] 비개발자도 쉽게 사용할 수 있는 직관적인 UI
- [ ] 저장 성공/실패 상태를 명확하게 표시

### Secondary Goals (개선)
- [ ] 변경 사항 미리보기 기능
- [ ] 편집 이력 조회 기능
- [ ] 실시간 동기화 (Supabase Realtime)

## 3. 해결 방안

### Phase 1: 즉시 반영 문제 해결 (Critical)

#### 3.1 캐시 전략 수정
```typescript
// 현재: staleTime 5분
staleTime: 1000 * 60 * 5

// 변경: staleTime 0 또는 짧게
staleTime: 0  // 항상 최신 데이터 fetch
// 또는
staleTime: 1000 * 30  // 30초
```

**수정 대상 파일:**
- `src/hooks/usePageSections.ts` - usePageSection, usePageSectionAdmin
- `src/hooks/useHeroStats.ts` - useHeroStats
- `src/hooks/useSpaceSlides.ts` - useSpaceSlides
- `src/hooks/useSystemCards.ts` - useSystemCards
- `src/hooks/useOperatingHours.ts` - useOperatingHours

#### 3.2 Query Invalidation 강화
```typescript
// 현재: 특정 key만 무효화
queryClient.invalidateQueries({ queryKey: ['page-sections', sectionKey] })

// 변경: 모든 관련 쿼리 무효화 + refetch 강제
queryClient.invalidateQueries({ queryKey: ['page-sections'] })
queryClient.refetchQueries({ queryKey: ['page-sections'], type: 'active' })
```

#### 3.3 에러 상태 표시 개선
```typescript
// 현재: 기본값으로 조용히 fallback
const badge = heroData?.badge ?? DEFAULT_HERO.badge

// 변경: 에러 상태 추가 및 표시
const { data: heroData, error, isLoading } = usePageSection('hero')
if (error) {
  // 에러 로깅 및 사용자 알림
  console.error('Failed to load hero data:', error)
}
```

### Phase 2: 관리자 UX 개선 (High)

#### 3.4 저장 상태 명확화
- 저장 중 로딩 인디케이터
- 저장 성공 시 "메인 페이지에 반영됨" 메시지
- 저장 실패 시 구체적인 에러 메시지
- **마지막 저장 시간 표시** (예: "마지막 저장: 3분 전")

#### 3.5 미리보기 기능
- 저장 전 변경사항 미리보기
- 모바일/데스크톱 미리보기 토글
- **라이브 프리뷰 패널** (편집 중 실시간 미리보기)

#### 3.6 입력 검증
- 필수 필드 표시 및 검증
- 문자 길이 제한 표시 + **실시간 카운터**
- 이미지 크기/포맷 검증
- **이미지 업로드 미리보기** (드래그 앤 드롭 지원)

#### 3.7 저장되지 않은 변경사항 보호 (NEW)
```typescript
// 페이지 이탈 시 경고
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '저장되지 않은 변경사항이 있습니다.';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```
- 탭 전환 시 미저장 경고
- 브라우저 닫기 시 확인 팝업

#### 3.8 편집 도우미 기능 (NEW)
- **툴팁/도움말 아이콘**: 각 필드별 입력 가이드
- **입력 예시**: placeholder에 실제 예시 텍스트
- **필드 설명**: 이 필드가 어디에 표시되는지 시각적 가이드

#### 3.9 되돌리기 기능 (NEW)
```typescript
// Undo/Redo 스택
const [history, setHistory] = useState<FormState[]>([]);
const [historyIndex, setHistoryIndex] = useState(-1);

const undo = () => { /* 이전 상태로 복원 */ };
const redo = () => { /* 다음 상태로 복원 */ };
```
- **Ctrl+Z / Ctrl+Y** 키보드 단축키
- "원래대로" 버튼 (DB 저장된 값으로 복원)

#### 3.10 변경 이력 조회 (NEW)
- 편집 이력 테이블 (section_edit_history 활용)
- 이전 버전과 비교 (diff view)
- 특정 버전으로 복원 기능

#### 3.11 접근성 개선 (NEW)
- 키보드 네비게이션 (Tab, Enter, Escape)
- 스크린리더 라벨
- 충분한 색상 대비

### Phase 3: 실시간 동기화 (Optional)

#### 3.12 Supabase Realtime 연동
```typescript
// 관리자 저장 → Supabase → 모든 클라이언트 자동 업데이트
useEffect(() => {
  const subscription = supabase
    .channel('page_sections_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'page_sections' },
      (payload) => {
        queryClient.invalidateQueries({ queryKey: ['page-sections'] })
      }
    )
    .subscribe()

  return () => subscription.unsubscribe()
}, [])
```

## 4. 구현 순서

```
Phase 1: Critical 이슈 해결 (저장 즉시 반영)
├── 1.1 usePageSections.ts staleTime 수정
├── 1.2 useHeroStats.ts staleTime 수정
├── 1.3 useSpaceSlides.ts staleTime 수정
├── 1.4 useSystemCards.ts staleTime 수정
├── 1.5 useOperatingHours.ts staleTime 수정
├── 1.6 mutation 후 refetchQueries 추가
└── 1.7 테스트: 저장 즉시 반영 확인

Phase 2-A: 핵심 UX 개선 (비개발자 필수)
├── 2.1 저장 상태 UI 개선 (로딩, 성공/실패)
├── 2.2 마지막 저장 시간 표시
├── 2.3 미저장 변경사항 경고 (페이지 이탈 방지)
├── 2.4 필수 필드 검증 + 에러 메시지
└── 2.5 문자 수 카운터

Phase 2-B: 편의 기능 (UX 향상)
├── 2.6 툴팁/도움말 아이콘
├── 2.7 입력 예시 개선
├── 2.8 이미지 업로드 미리보기
├── 2.9 "원래대로" 버튼 (DB값 복원)
└── 2.10 키보드 단축키 (Ctrl+S 저장)

Phase 2-C: 고급 기능 (선택적)
├── 2.11 라이브 프리뷰 패널
├── 2.12 Undo/Redo 히스토리
├── 2.13 변경 이력 조회 UI
└── 2.14 이전 버전 복원 기능

Phase 3: 실시간 동기화 (Optional)
├── 3.1 Supabase Realtime 구독 설정
├── 3.2 자동 refetch 로직 추가
└── 3.3 테스트: 다중 브라우저 동기화
```

## 5. 영향 범위

### 수정 대상 파일

| 파일 경로 | 수정 내용 |
|-----------|----------|
| `src/hooks/usePageSections.ts` | staleTime 수정, refetch 강화 |
| `src/hooks/useHeroStats.ts` | staleTime 수정 |
| `src/hooks/useSpaceSlides.ts` | staleTime 수정 |
| `src/hooks/useSystemCards.ts` | staleTime 수정 |
| `src/hooks/useOperatingHours.ts` | staleTime 수정 |
| `src/components/admin/*Editor.tsx` | 저장 UI/UX 개선 |
| `src/components/*Section.tsx` | 에러 상태 처리 (선택적) |

### 영향 없는 파일
- DB 스키마 변경 없음
- API 라우트 변경 없음
- 메인 페이지 레이아웃 변경 없음

## 6. 테스트 체크리스트

### 기능 테스트
- [ ] Hero 섹션: badge, headline, description 수정 → 즉시 반영
- [ ] Space 섹션: title, slides 수정 → 즉시 반영
- [ ] System 섹션: cards 추가/수정/삭제 → 즉시 반영
- [ ] Program 섹션: banner, hours 수정 → 즉시 반영

### 에러 케이스 테스트
- [ ] 네트워크 오프라인 상태에서 저장 시도 → 에러 메시지
- [ ] 빈 필드 저장 시도 → 검증 에러
- [ ] 동시 편집 충돌 → 적절한 처리

### 사용성 테스트
- [ ] 비개발자가 10분 내 콘텐츠 수정 가능
- [ ] 저장 결과를 명확히 인지 가능

## 7. 성공 기준

| 지표 | 현재 | 목표 |
|------|------|------|
| 콘텐츠 반영 시간 | ~5분 | **즉시 (< 3초)** |
| 저장 실패 인지율 | 낮음 | **100%** |
| 비개발자 수정 성공률 | 불확실 | **95% 이상** |

## 8. 리스크

| 리스크 | 대응 방안 |
|--------|----------|
| staleTime 0으로 인한 API 호출 증가 | `refetchOnMount: false` 옵션 병행 |
| 기존 캐시 전략 의존 코드 존재 | 영향 범위 사전 분석 |
| 배포 후 문제 발생 | Vercel preview 환경에서 충분한 테스트 |

---

## 9. 추가 UX 제안 (현재 분석 기반)

### 현재 어드민 UI 분석 결과

**잘 되어 있는 부분:**
- ✅ 탭 기반 네비게이션 (상담/공지/페이지/설정)
- ✅ 드래그 앤 드롭 정렬 (SortableList)
- ✅ 모달 기반 편집 (Dialog)
- ✅ 삭제 확인 (AlertDialog)
- ✅ 아이콘 선택 UI (iconOptions)

**개선이 필요한 부분:**

| 문제 | 현재 상태 | 제안 |
|------|----------|------|
| 미리보기 없음 | 저장 후에만 확인 가능 | 라이브 프리뷰 패널 |
| 미저장 경고 없음 | 탭 이동 시 데이터 유실 가능 | beforeunload 이벤트 |
| 문자 수 표시 없음 | 제한 없이 입력 | 카운터 + 제한 표시 |
| 마지막 저장 시간 없음 | 언제 저장했는지 모름 | 타임스탬프 표시 |
| 도움말 부족 | 필드 용도 파악 어려움 | 툴팁 + 위치 가이드 |
| 되돌리기 없음 | 실수 시 복구 불가 | Undo/원래대로 버튼 |
| 이미지 미리보기 없음 | URL만 입력 | 드래그앤드롭 + 프리뷰 |

### 우선순위별 구현 제안

**🔴 높음 (비개발자 필수)**
1. 미저장 변경사항 경고
2. 저장 상태 개선 (성공/실패 명확화)
3. 마지막 저장 시간 표시
4. "원래대로" 버튼

**🟡 중간 (사용성 향상)**
5. 문자 수 카운터
6. 툴팁/도움말
7. 이미지 업로드 개선
8. Ctrl+S 저장 단축키

**🟢 낮음 (고급 기능)**
9. 라이브 프리뷰
10. Undo/Redo
11. 변경 이력 조회
12. 버전 복원

---

**작성일**: 2026-02-24
**Feature**: admin-cms-fix
**Phase**: Plan
**Status**: Updated with UX recommendations
