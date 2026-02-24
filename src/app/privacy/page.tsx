import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 - 개인정보 보호 안내',
  description:
    'STUDYCORE 1.0 개인정보처리방침입니다. 개인정보의 수집, 이용, 보유, 파기에 관한 정책과 정보주체의 권리 행사 방법을 안내합니다. 개인정보보호법을 준수합니다.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: '개인정보처리방침 | STUDYCORE 1.0',
    description: 'STUDYCORE 1.0 개인정보처리방침',
    url: 'https://studycore.kr/privacy',
    type: 'website',
  },
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-900 pt-20">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-white mb-8">개인정보처리방침</h1>

          <div className="bg-slate-800 rounded-lg p-8 prose prose-invert max-w-none">
            <h2>1. 개인정보의 처리 목적</h2>
            <p>
              스터디코어 1.0은 다음의 목적을 위하여 개인정보를 처리합니다.
              처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
              이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
            </p>
            <ul>
              <li>상담 신청 접수 및 처리</li>
              <li>서비스 제공 및 이용자 관리</li>
              <li>공지사항 및 이벤트 안내</li>
            </ul>

            <h2>2. 개인정보의 처리 및 보유기간</h2>
            <p>
              스터디코어 1.0은 법령에 따른 개인정보 보유·이용기간 또는
              정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서
              개인정보를 처리·보유합니다.
            </p>

            <h2>3. 정보주체의 권리·의무 및 행사방법</h2>
            <p>
              정보주체는 스터디코어 1.0에 대해 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
            </p>
            <ul>
              <li>개인정보 열람 요구</li>
              <li>오류 등이 있을 경우 정정 요구</li>
              <li>삭제 요구</li>
              <li>처리정지 요구</li>
            </ul>

            <h2>4. 개인정보의 안전성 확보조치</h2>
            <p>
              스터디코어 1.0은 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.
            </p>
            <ul>
              <li>개인정보의 암호화</li>
              <li>해킹 등에 대비한 기술적 대책</li>
              <li>개인정보에 대한 접근 제한</li>
            </ul>

            <h2>5. 개인정보 보호책임자</h2>
            <p>
              스터디코어 1.0은 개인정보 처리에 관한 업무를 총괄해서 책임지고,
              개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여
              개인정보 보호책임자를 지정하고 있습니다.
            </p>

            <p className="text-slate-400 text-sm mt-8">
              시행일자: 2024년 1월 1일
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
