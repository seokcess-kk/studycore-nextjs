'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { LogOut, RefreshCw, MessageSquare, Bell, LayoutGrid, Settings } from 'lucide-react';

// Dynamic imports for code splitting (bundle-dynamic-imports optimization)
const ConsultationTable = dynamic(
  () => import('@/components/admin/ConsultationTable'),
  { loading: () => <Skeleton className="h-96 w-full" /> }
);
const NoticeTable = dynamic(
  () => import('@/components/admin/NoticeTable'),
  { loading: () => <Skeleton className="h-96 w-full" /> }
);
const PageContentTab = dynamic(
  () => import('@/components/admin/PageContentTab').then(m => ({ default: m.PageContentTab })),
  { loading: () => <Skeleton className="h-96 w-full" /> }
);

interface Consultation {
  id: string;
  student_name: string;
  student_phone: string;
  parent_phone: string | null;
  school_grade: string;
  meal_request: string | null;
  status: string | null;
  created_at: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  show_as_popup: boolean;
  created_at: string;
}

export default function AdminPage() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showPopup, setShowPopup] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [verifiedAdmin, setVerifiedAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  // Server-side admin verification using the has_role database function
  useEffect(() => {
    const verifyAdminRole = async () => {
      if (!user) {
        setVerifiedAdmin(false);
        return;
      }

      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });

      if (error) {
        console.error('Failed to verify admin role:', error);
        setVerifiedAdmin(false);
        return;
      }

      setVerifiedAdmin(data === true);
    };

    if (user) {
      verifyAdminRole();
    }
  }, [user]);

  useEffect(() => {
    if (user && verifiedAdmin) {
      fetchData();
    }
  }, [user, verifiedAdmin]);

  const fetchData = async () => {
    setLoadingData(true);

    // Parallel fetch all data (async-parallel optimization)
    const [consultResult, noticeResult, settingResult] = await Promise.all([
      supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false }),
      supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'show_popup')
        .maybeSingle()
    ]);

    if (consultResult.data) setConsultations(consultResult.data);
    if (noticeResult.data) setNotices(noticeResult.data);
    if (settingResult.data) setShowPopup(settingResult.data.value === 'true');

    setLoadingData(false);
  };

  const togglePopup = async (checked: boolean) => {
    const { error } = await supabase
      .from('site_settings')
      .update({ value: checked ? 'true' : 'false' })
      .eq('key', 'show_popup');

    if (error) {
      toast.error('설정 변경에 실패했습니다');
    } else {
      setShowPopup(checked);
      toast.success('팝업 설정이 변경되었습니다');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!verifiedAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">관리자 권한이 필요합니다.</p>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">스터디코어 1.0 관리자</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              새로고침
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="consultations" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="consultations" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              상담 관리
            </TabsTrigger>
            <TabsTrigger value="notices" className="gap-2">
              <Bell className="w-4 h-4" />
              공지사항
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <LayoutGrid className="w-4 h-4" />
              페이지 관리
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              설정
            </TabsTrigger>
          </TabsList>

          <TabsContent value="consultations">
            <ConsultationTable consultations={consultations} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="notices">
            <NoticeTable notices={notices} onRefresh={fetchData} />
          </TabsContent>

          <TabsContent value="pages">
            <Card>
              <CardContent className="pt-6">
                <PageContentTab />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>사이트 설정</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span>윈터스쿨 팝업 표시</span>
                  <Switch checked={showPopup} onCheckedChange={togglePopup} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
