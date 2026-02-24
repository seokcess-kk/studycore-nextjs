import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NoticeList } from '@/components/NoticeList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '공지사항 - 스터디코어 소식 및 이벤트 안내',
  description:
    'STUDYCORE 1.0 공지사항 페이지입니다. 독서실 운영 안내, 시설 업데이트, 프로모션 및 이벤트 정보를 확인하세요. 학습환경 개선 소식을 가장 먼저 만나보세요.',
  alternates: {
    canonical: '/notices',
  },
  openGraph: {
    title: '공지사항 | STUDYCORE 1.0',
    description: '스터디코어 공지사항 및 이벤트 안내. 최신 소식을 확인하세요.',
    url: 'https://studycore.kr/notices',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: '공지사항 | STUDYCORE 1.0',
    description: '스터디코어 공지사항 및 이벤트 안내',
  },
};

export default function NoticesPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-900 pt-20">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-white mb-8">공지사항</h1>
          <Suspense fallback={<NoticeListSkeleton />}>
            <NoticeList />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}

function NoticeListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-slate-800 rounded-lg p-6 animate-pulse">
          <div className="h-6 bg-slate-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-slate-700 rounded w-1/4"></div>
        </div>
      ))}
    </div>
  );
}
