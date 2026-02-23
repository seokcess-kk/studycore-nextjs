'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

const navItems = [
  { label: "브랜드 소개", href: "/#about", isAnchor: true },
  { label: "프리미엄 공간", href: "/#space", isAnchor: true },
  { label: "관리 시스템", href: "/#system", isAnchor: true },
  { label: "프로그램", href: "/#program", isAnchor: true },
  { label: "공지사항", href: "/notices", isAnchor: false },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isCurrentPage = (href: string) => {
    if (href.startsWith('/#')) {
      return pathname === '/';
    }
    return pathname === href;
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? "bg-card shadow-lg shadow-border/50 py-3" : "bg-surface-dark/80 backdrop-blur-md py-4"
      }`}
    >
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
      >
        메인 콘텐츠로 건너뛰기
      </a>

      <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center group" aria-label="StudyCore 홈으로 이동">
          <Image
            src="/assets/logo.png"
            alt="Study Core 1.0"
            width={150}
            height={64}
            className={`transition-all duration-300 ${isScrolled ? "h-12 md:h-14 w-auto" : "h-14 md:h-16 w-auto"}`}
            priority
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="메인 네비게이션">
          {navItems.map((item) => {
            const isCurrent = isCurrentPage(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={`relative px-4 py-2 text-sm font-semibold transition-all duration-200 rounded-lg group ${
                  isScrolled
                    ? isCurrent
                      ? "text-primary bg-primary-muted"
                      : "text-muted-foreground hover:text-primary hover:bg-primary-muted"
                    : isCurrent
                      ? "text-text-on-dark bg-text-on-dark/20"
                      : "text-text-on-dark/90 hover:text-text-on-dark hover:bg-text-on-dark/10"
                }`}
              >
                {item.label}
                <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-full" />
              </Link>
            );
          })}
          <Button
            asChild
            className="ml-4 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 font-bold px-6 rounded-xl"
          >
            <Link href="/#contact" className="flex items-center gap-2">
              <Icon icon="solar:chat-round-call-bold" className="w-4 h-4" />
              상담 신청
            </Link>
          </Button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button
          className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${
            isScrolled ? "text-card-foreground hover:text-primary hover:bg-primary-muted" : "text-text-on-dark hover:bg-text-on-dark/10"
          }`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          <Icon icon={isMobileMenuOpen ? "solar:close-circle-bold" : "solar:hamburger-menu-bold"} className="w-6 h-6" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-card mt-2 mx-4 rounded-2xl p-5 shadow-2xl border border-border"
        >
          <nav
            id="mobile-navigation"
            className="flex flex-col gap-2"
            aria-label="모바일 메뉴"
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-semibold text-muted-foreground hover:text-primary hover:bg-primary-muted transition-all duration-200 py-3 px-4 rounded-xl"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Button
              asChild
              className="mt-2 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground w-full font-bold py-6 rounded-xl"
            >
              <Link
                href="/#contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2"
              >
                <Icon icon="solar:chat-round-call-bold" className="w-5 h-5" />
                상담 신청
              </Link>
            </Button>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};
