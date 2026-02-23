// Admin 페이지는 인증이 필요하므로 정적 프리렌더링을 방지합니다.
// Supabase 환경 변수가 빌드 시점에 없어도 배포가 실패하지 않습니다.
export const dynamic = 'force-dynamic';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
