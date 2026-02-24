'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';

export function MobileFloatingCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtContact, setIsAtContact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const heroHeight = window.innerHeight;
      const contactSection = document.getElementById('contact');

      // Hero 섹션 50% 지나면 표시
      setIsVisible(scrollY > heroHeight * 0.5);

      // Contact 섹션에 도달하면 숨김
      if (contactSection) {
        const contactTop = contactSection.offsetTop;
        setIsAtContact(scrollY + window.innerHeight > contactTop + 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  // Contact 섹션에 있으면 표시 안함
  const shouldShow = isVisible && !isAtContact;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-40 md:hidden
                     p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]
                     bg-gradient-to-t from-surface-dark via-surface-dark/98 to-surface-dark/90
                     backdrop-blur-lg border-t border-border/30"
        >
          <Button
            onClick={scrollToContact}
            className="w-full bg-gradient-to-r from-primary to-primary-hover
                       text-primary-foreground hover:shadow-xl hover:shadow-primary/25
                       py-6 text-base font-bold rounded-xl"
            size="lg"
          >
            <Icon icon="solar:chat-round-call-bold" className="mr-2 h-5 w-5" />
            상담 신청하기
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
