import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Script from 'next/script';

interface NoticePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NoticePageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: notice } = await supabase
    .from('notices')
    .select('title, content, created_at')
    .eq('id', id)
    .single();

  if (!notice) {
    return {
      title: '공지사항을 찾을 수 없습니다',
      robots: { index: false, follow: false },
    };
  }

  const description =
    notice.content && notice.content.length > 155
      ? notice.content.substring(0, 152) + '...'
      : notice.content || notice.title;

  return {
    title: notice.title,
    description: `STUDYCORE 공지: ${description}`,
    alternates: {
      canonical: `/notices/${id}`,
    },
    openGraph: {
      title: notice.title,
      description: description,
      type: 'article',
      publishedTime: notice.created_at,
      authors: ['STUDYCORE'],
      url: `https://studycore.kr/notices/${id}`,
    },
    twitter: {
      card: 'summary',
      title: notice.title,
      description: description,
    },
  };
}

export default async function NoticePage({ params }: NoticePageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: notice } = await supabase
    .from('notices')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single();

  if (!notice) {
    notFound();
  }

  // 조회수 증가 (비동기, 에러 무시)
  supabase.rpc('increment_notice_view_count', { notice_id: id }).then();

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: notice.title,
    datePublished: notice.created_at,
    dateModified: notice.updated_at || notice.created_at,
    author: {
      '@type': 'Organization',
      name: 'STUDYCORE',
      url: 'https://studycore.kr',
    },
    publisher: {
      '@type': 'Organization',
      name: 'STUDYCORE 1.0',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://studycore.kr/notices/${id}`,
    },
  };

  return (
    <>
      <Script
        id="article-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Header />
      <main className="min-h-screen bg-slate-900 pt-20">
        <div className="container mx-auto px-4 py-12">
          <Button asChild variant="ghost" className="mb-6 text-slate-400 hover:text-white">
            <Link href="/notices">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로
            </Link>
          </Button>

          <article className="bg-slate-800 rounded-lg p-8">
            <header className="mb-8 border-b border-slate-700 pb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                {notice.title}
              </h1>
              <time className="text-slate-400">
                {new Date(notice.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </header>

            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                {notice.content}
              </p>
            </div>
          </article>
        </div>
      </main>
      <Footer />
    </>
  );
}
