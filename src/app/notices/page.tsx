import { Suspense } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { NoticeList } from '@/components/NoticeList';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '공지사항',
  description: 'STUDYCORE 1.0 공지사항 및 소식',
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
