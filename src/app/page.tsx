import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { SpaceSection } from '@/components/SpaceSection';
import { SystemSection } from '@/components/SystemSection';
import { ProgramSection } from '@/components/ProgramSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';
import type { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  alternates: {
    canonical: 'https://studycore.kr',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': 'https://studycore.kr/#business',
      name: 'STUDYCORE 1.0',
      alternateName: '스터디코어',
      description:
        '수험생을 위한 프리미엄 관리형 독서실. 체계적인 학습관리와 1:1 멘토링 제공.',
      url: 'https://studycore.kr',
      image: 'https://studycore.kr/og-image.jpg',
      priceRange: '₩₩',
      currenciesAccepted: 'KRW',
      paymentAccepted: ['Cash', 'Credit Card', 'Bank Transfer'],
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://studycore.kr/#organization',
      name: 'STUDYCORE 1.0',
      alternateName: '스터디코어',
      description: '학습관리의 첫 번째 완성형 시스템. 프리미엄 관리형 독서실.',
      url: 'https://studycore.kr',
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: '학습 프로그램',
        itemListElement: [
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: '프리미엄 좌석',
              description: '개인 학습 공간 및 프리미엄 시설 이용',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: '1:1 멘토링',
              description: '맞춤형 학습 상담 및 관리 서비스',
            },
          },
          {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: '학습관리 시스템',
              description: '체계적인 학습 계획 및 진도 관리',
            },
          },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://studycore.kr/#website',
      url: 'https://studycore.kr',
      name: 'STUDYCORE 1.0',
      description: '프리미엄 관리형 독서실',
      inLanguage: 'ko-KR',
    },
  ],
};

export default function Home() {
  return (
    <>
      <Script
        id="json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main id="main-content">
        <HeroSection />
        <SpaceSection />
        <SystemSection />
        <ProgramSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
