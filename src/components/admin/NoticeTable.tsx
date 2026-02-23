import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import NoticeModal from './NoticeModal';

interface Notice {
  id: string;
  title: string;
  content: string;
  is_published: boolean;
  show_as_popup: boolean;
  created_at: string;
}

interface NoticeTableProps {
  notices: Notice[];
  onRefresh: () => void;
}

export default function NoticeTable({ notices, onRefresh }: NoticeTableProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noticeToDelete, setNoticeToDelete] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    setSelectedNotice(null);
    setModalOpen(true);
  };

  const handleEdit = (notice: Notice) => {
    setSelectedNotice(notice);
    setModalOpen(true);
  };

  const handleDeleteClick = (notice: Notice) => {
    setNoticeToDelete(notice);
    setDeleteDialogOpen(true);
  };

  const handleSave = async (data: { title: string; content: string; is_published: boolean; show_as_popup: boolean; image_url?: string | null; image_urls?: string[]; attachment_url?: string | null; attachment_name?: string | null }) => {
    setSaving(true);
    
    if (selectedNotice) {
      // Update existing notice
      const { error } = await supabase
        .from('notices')
        .update({
          title: data.title,
          content: data.content,
          is_published: data.is_published,
          show_as_popup: data.show_as_popup,
          image_url: data.image_url,
          image_urls: data.image_urls || [],
          attachment_url: data.attachment_url,
          attachment_name: data.attachment_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedNotice.id);

      if (error) {
        toast.error('공지사항 수정에 실패했습니다');
      } else {
        toast.success('공지사항이 수정되었습니다');
        setModalOpen(false);
        onRefresh();
      }
    } else {
      // Create new notice
      const { error } = await supabase
        .from('notices')
        .insert({
          title: data.title,
          content: data.content,
          is_published: data.is_published,
          show_as_popup: data.show_as_popup,
          image_url: data.image_url,
          image_urls: data.image_urls || [],
          attachment_url: data.attachment_url,
          attachment_name: data.attachment_name,
        });

      if (error) {
        toast.error('공지사항 등록에 실패했습니다');
      } else {
        toast.success('공지사항이 등록되었습니다');
        setModalOpen(false);
        onRefresh();
      }
    }
    
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!noticeToDelete) return;

    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', noticeToDelete.id);

    if (error) {
      toast.error('공지사항 삭제에 실패했습니다');
    } else {
      toast.success('공지사항이 삭제되었습니다');
      onRefresh();
    }
    
    setDeleteDialogOpen(false);
    setNoticeToDelete(null);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>공지사항 관리</CardTitle>
          <Button onClick={handleCreate} size="sm">
            <Icon icon="solar:add-circle-bold" className="mr-2 h-4 w-4" />
            공지 등록
          </Button>
        </CardHeader>
        <CardContent>
          {notices.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">번호</TableHead>
                  <TableHead>제목</TableHead>
                  <TableHead className="w-24">상태</TableHead>
                  <TableHead className="w-32">등록일</TableHead>
                  <TableHead className="w-24 text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((notice, index) => (
                  <TableRow key={notice.id}>
                    <TableCell className="text-muted-foreground">
                      {notices.length - index}
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {notice.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant={notice.is_published ? 'default' : 'secondary'}>
                          {notice.is_published ? '공개' : '비공개'}
                        </Badge>
                        {notice.show_as_popup && (
                          <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10">
                            팝업
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(notice.created_at), 'yyyy.MM.dd')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(notice)}
                        >
                          <Icon icon="solar:pen-2-linear" className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(notice)}
                        >
                          <Icon icon="solar:trash-bin-trash-linear" className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <NoticeModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        notice={selectedNotice}
        onSave={handleSave}
        loading={saving}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>공지사항 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{noticeToDelete?.title}&quot; 공지사항을 삭제하시겠습니까?
              <br />
              이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
