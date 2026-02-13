import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeroSectionEditor } from './HeroSectionEditor';
import { SpaceSectionEditor } from './SpaceSectionEditor';
import { SystemSectionEditor } from './SystemSectionEditor';
import { ProgramSectionEditor } from './ProgramSectionEditor';
import { EditHistoryView } from './EditHistoryView';
import { LayoutGrid } from 'lucide-react';

export function PageContentTab() {
  const [activeTab, setActiveTab] = useState('hero');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <LayoutGrid className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-bold">페이지 관리</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">히어로</TabsTrigger>
          <TabsTrigger value="space">공간</TabsTrigger>
          <TabsTrigger value="system">관리 시스템</TabsTrigger>
          <TabsTrigger value="program">프로그램</TabsTrigger>
          <TabsTrigger value="history">변경 이력</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-6">
          <HeroSectionEditor />
        </TabsContent>

        <TabsContent value="space" className="mt-6">
          <SpaceSectionEditor />
        </TabsContent>

        <TabsContent value="system" className="mt-6">
          <SystemSectionEditor />
        </TabsContent>

        <TabsContent value="program" className="mt-6">
          <ProgramSectionEditor />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <EditHistoryView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
