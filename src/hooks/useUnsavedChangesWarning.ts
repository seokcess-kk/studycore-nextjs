import { useEffect } from 'react';

/**
 * 저장되지 않은 변경사항이 있을 때 페이지 이탈 시 경고를 표시합니다.
 * @param hasChanges - 변경사항 존재 여부
 */
export function useUnsavedChangesWarning(hasChanges: boolean) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        // 대부분의 브라우저에서 커스텀 메시지는 무시되지만, 표준 확인 다이얼로그가 표시됨
        e.returnValue = '저장되지 않은 변경사항이 있습니다. 정말 나가시겠습니까?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges]);
}
