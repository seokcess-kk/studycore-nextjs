import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '관리자 로그인',
  description: 'STUDYCORE 1.0 관리자 로그인 페이지',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
