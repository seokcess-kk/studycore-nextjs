import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

interface NoticePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: NoticePageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: notice } = await supabase
    .from('notices')
    .select('title')
    .eq('id', id)
    .single();

  if (!notice) {
    return { title: '공지사항을 찾을 수 없습니다' };
  }

  return {
    title: notice.title,
    description: `STUDYCORE 공지사항: ${notice.title}`,
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

  return (
    <>
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
