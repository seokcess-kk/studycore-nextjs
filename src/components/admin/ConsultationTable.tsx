import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

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

interface ConsultationTableProps {
  consultations: Consultation[];
  onRefresh: () => void;
}

const statusOptions = [
  { value: 'pending', label: '대기' },
  { value: 'contacted', label: '연락완료' },
  { value: 'scheduled', label: '상담예정' },
  { value: 'completed', label: '완료' },
  { value: 'cancelled', label: '취소' },
];

export default function ConsultationTable({ consultations, onRefresh }: ConsultationTableProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from('consultations')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error('상태 변경에 실패했습니다');
    } else {
      toast.success('상태가 변경되었습니다');
      onRefresh();
    }
    setUpdatingId(null);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error('삭제에 실패했습니다');
    } else {
      toast.success('삭제되었습니다');
      onRefresh();
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusInfo = statusOptions.find(s => s.value === status) || { label: status || '대기', value: status };
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      pending: 'secondary',
      contacted: 'outline',
      scheduled: 'default',
      completed: 'default',
      cancelled: 'destructive',
    };
    return (
      <Badge variant={variants[status || 'pending'] || 'secondary'}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>상담 신청 관리 ({consultations.length}건)</CardTitle>
      </CardHeader>
      <CardContent>
        {consultations.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">아직 상담 신청이 없습니다.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>학생명</TableHead>
                  <TableHead>학년</TableHead>
                  <TableHead>학생 연락처</TableHead>
                  <TableHead>학부모 연락처</TableHead>
                  <TableHead>식사 신청</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>신청일</TableHead>
                  <TableHead className="text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.student_name}</TableCell>
                    <TableCell>{c.school_grade}</TableCell>
                    <TableCell>{c.student_phone}</TableCell>
                    <TableCell>{c.parent_phone || '-'}</TableCell>
                    <TableCell>{c.meal_request || '신청 안함'}</TableCell>
                    <TableCell>
                      <Select
                        value={c.status || 'pending'}
                        onValueChange={(value) => handleStatusChange(c.id, value)}
                        disabled={updatingId === c.id}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue>{getStatusBadge(c.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{new Date(c.created_at).toLocaleDateString('ko-KR')}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>삭제 확인</AlertDialogTitle>
                            <AlertDialogDescription>
                              {c.student_name} 학생의 상담 신청을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>취소</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(c.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              삭제
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
