import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';
import { ScrollProgress } from '@/components/ScrollProgress';
import { MobileFloatingCTA } from '@/components/MobileFloatingCTA';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://studycore.kr'),
  title: {
    default: 'STUDYCORE 1.0 - 프리미엄 관리형 독서실 | 수험생 맞춤 학습공간',
    template: '%s | STUDYCORE 1.0',
  },
  description:
    '학습관리의 첫 번째 완성형 시스템. 수험생을 위한 프리미엄 관리형 독서실. 1:1 멘토링, 집중학습 환경, 체계적인 학습관리 시스템을 제공합니다.',
  keywords: [
    '관리형 독서실',
    '프리미엄 독서실',
    '수험생 독서실',
    '학습관리',
    '스터디카페',
    '1:1 멘토링',
    '집중학습',
    '자기주도학습',
    '독서실 추천',
    '스터디코어',
  ],
  authors: [{ name: 'STUDYCORE', url: 'https://studycore.kr' }],
  creator: 'STUDYCORE',
  publisher: 'STUDYCORE',
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://studycore.kr',
    siteName: 'STUDYCORE 1.0',
    title: 'STUDYCORE 1.0 - 프리미엄 관리형 독서실',
    description:
      '학습관리의 첫 번째 완성형 시스템. 수험생을 위한 프리미엄 관리형 독서실에서 집중력을 높이세요.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'STUDYCORE 1.0 프리미엄 관리형 독서실',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'STUDYCORE 1.0 - 프리미엄 관리형 독서실',
    description:
      '학습관리의 첫 번째 완성형 시스템. 수험생을 위한 프리미엄 관리형 독서실.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'education',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
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
          <ScrollProgress />
          {children}
          <MobileFloatingCTA />
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}
