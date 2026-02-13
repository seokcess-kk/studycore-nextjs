import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'STUDYCORE 1.0 - 프리미엄 관리형 독서실',
    template: '%s | STUDYCORE 1.0',
  },
  description: '학습관리의 첫 번째 완성형 시스템. 몰입의 깊이가 다른 프리미엄 관리형 독서실.',
  keywords: ['독서실', '관리형 독서실', '스터디카페', '학습관리', '프리미엄 독서실'],
  authors: [{ name: 'STUDYCORE' }],
  creator: 'STUDYCORE',
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://studycore.kr',
    siteName: 'STUDYCORE 1.0',
    title: 'STUDYCORE 1.0 - 프리미엄 관리형 독서실',
    description: '학습관리의 첫 번째 완성형 시스템',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#14b8a6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          {children}
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
