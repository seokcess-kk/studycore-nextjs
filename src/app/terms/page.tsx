import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '이용약관 - 서비스 이용 안내',
  description:
    'STUDYCORE 1.0 이용약관입니다. 관리형 독서실 서비스 이용에 관한 권리, 의무, 책임사항 및 기타 필요한 사항을 안내합니다. 서비스 이용 전 반드시 확인해주세요.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: '이용약관 | STUDYCORE 1.0',
    description: 'STUDYCORE 1.0 서비스 이용약관',
    url: 'https://studycore.kr/terms',
    type: 'website',
  },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-900 pt-20">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-white mb-8">이용약관</h1>

          <div className="bg-slate-800 rounded-lg p-8 prose prose-invert max-w-none">
            <h2>제1조 (목적)</h2>
            <p>
              이 약관은 스터디코어 1.0(이하 &quot;회사&quot;)이 제공하는 서비스의 이용과 관련하여
              회사와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>

            <h2>제2조 (정의)</h2>
            <p>이 약관에서 사용하는 용어의 정의는 다음과 같습니다.</p>
            <ul>
              <li>&quot;서비스&quot;란 회사가 제공하는 관리형 독서실 서비스를 의미합니다.</li>
              <li>&quot;이용자&quot;란 이 약관에 따라 회사가 제공하는 서비스를 이용하는 자를 말합니다.</li>
            </ul>

            <h2>제3조 (서비스의 제공)</h2>
            <p>회사는 다음과 같은 서비스를 제공합니다.</p>
            <ul>
              <li>학습 공간 제공</li>
              <li>학습 관리 서비스</li>
              <li>멘토링 서비스</li>
              <li>기타 회사가 정하는 서비스</li>
            </ul>

            <h2>제4조 (이용계약의 성립)</h2>
            <p>
              이용계약은 이용자가 약관의 내용에 동의한 후 상담 신청을 하고,
              회사가 이를 승낙함으로써 성립됩니다.
            </p>

            <h2>제5조 (이용자의 의무)</h2>
            <p>이용자는 다음 각 호의 행위를 하여서는 안 됩니다.</p>
            <ul>
              <li>다른 이용자의 학습을 방해하는 행위</li>
              <li>시설물을 훼손하는 행위</li>
              <li>기타 관련 법령에 위반되는 행위</li>
            </ul>

            <h2>제6조 (면책조항)</h2>
            <p>
              회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는
              서비스 제공에 관한 책임이 면제됩니다.
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
