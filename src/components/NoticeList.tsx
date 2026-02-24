'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';

interface Notice {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  view_count: number;
  created_at: string;
}

export function NoticeList() {
  const { data: notices, isLoading, error } = useQuery({
    queryKey: ['notices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notice[];
    },
  });

  if (isLoading) {
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

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">공지사항을 불러오는데 실패했습니다.</p>
      </div>
    );
  }

  if (!notices || notices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">등록된 공지사항이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {notices.map((notice) => (
        <Link key={notice.id} href={`/notices/${notice.id}`}>
          <Card className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-white mb-2 line-clamp-1">
                {notice.title}
              </h2>
              <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                {notice.content}
              </p>
              <div className="flex items-center gap-4 text-slate-500 text-sm">
                <time>
                  {new Date(notice.created_at).toLocaleDateString('ko-KR')}
                </time>
                <span>조회 {notice.view_count}</span>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
