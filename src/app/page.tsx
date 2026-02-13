import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { SpaceSection } from '@/components/SpaceSection';
import { SystemSection } from '@/components/SystemSection';
import { ProgramSection } from '@/components/ProgramSection';
import { ContactSection } from '@/components/ContactSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  return (
    <>
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
