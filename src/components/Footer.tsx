'use client';

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import Link from "next/link";
import Image from "next/image";

export const Footer = () => {
  const contactItems = [
    {
      icon: "solar:camera-bold",
      label: "@studycore1.0_official",
      href: "https://instagram.com/studycore1.0_official/",
      external: true,
    },
    {
      icon: "solar:phone-bold",
      label: "010-4408-3790",
      href: "tel:01044083790",
      external: false,
    },
    {
      icon: "solar:letter-bold",
      label: "studycore10@naver.com",
      href: "mailto:studycore10@naver.com",
      external: false,
    },
  ];

  const quickLinks = [
    { label: "브랜드 소개", href: "/#brand" },
    { label: "프리미엄 공간", href: "/#space" },
    { label: "관리 시스템", href: "/#system" },
    { label: "프로그램", href: "/#program" },
    { label: "공지사항", href: "/notices" },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      className="relative bg-surface-darkest text-text-on-dark overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-surface-dark via-surface-darkest to-surface-darkest pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
            <div className="lg:col-span-1">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="mb-5"
              >
                <Image
                  src="/assets/logo.png"
                  alt="Study Core 1.0"
                  width={120}
                  height={36}
                  className="h-9 w-auto brightness-0 invert opacity-90"
                />
              </motion.div>
              <p className="text-text-muted text-sm leading-relaxed mb-6">
                학습관리의 첫 번째 완성형 시스템
                <br />
                <span className="text-primary">프리미엄 관리형 독서실</span>
              </p>

              <div className="flex gap-2" role="list" aria-label="소셜 미디어 링크">
                <motion.a
                  href="https://www.instagram.com/studycore1.0_official/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="StudyCore 인스타그램 (새 창에서 열림)"
                  className="w-9 h-9 rounded-lg bg-surface-dark/60 border border-border/50 flex items-center justify-center text-text-muted hover:text-text-on-dark hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:border-transparent transition-all duration-300"
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon icon="mdi:instagram" className="w-4 h-4" aria-hidden="true" />
                </motion.a>
                <motion.a
                  href="http://pf.kakao.com/_execQn"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="StudyCore 카카오톡 채널 (새 창에서 열림)"
                  className="w-9 h-9 rounded-lg bg-surface-dark/60 border border-border/50 flex items-center justify-center text-text-muted hover:text-surface-dark hover:bg-[#FEE500] hover:border-transparent transition-all duration-300"
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon icon="simple-icons:kakaotalk" className="w-4 h-4" aria-hidden="true" />
                </motion.a>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-on-dark mb-5 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                바로가기
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-text-muted text-sm hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                    >
                      <Icon
                        icon="solar:arrow-right-linear"
                        className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200"
                      />
                      <span>{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-on-dark mb-5 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                연락처
              </h4>
              <ul className="space-y-3">
                {contactItems.map((item, index) => (
                  <li key={index}>
                    <a
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="flex items-center gap-3 text-text-muted text-sm hover:text-primary transition-colors group"
                    >
                      <span className="w-7 h-7 rounded-md bg-surface-dark/60 border border-border/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-200">
                        <Icon icon={item.icon} className="w-3.5 h-3.5 text-primary" />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-text-on-dark mb-5 flex items-center gap-2">
                <span className="w-1 h-4 bg-primary rounded-full" />
                오시는 길
              </h4>
              <div className="flex items-start gap-3 text-text-muted text-sm mb-4">
                <span className="w-7 h-7 rounded-md bg-surface-dark/60 border border-border/50 flex items-center justify-center flex-shrink-0">
                  <Icon icon="solar:map-point-bold" className="w-3.5 h-3.5 text-primary" />
                </span>
                <p className="leading-relaxed">
                  광주광역시 광산구
                  <br />
                  임방울대로 330
                  <br />
                  애플타워 10층 1003호
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5" role="list" aria-label="지도 서비스 링크">
                <a
                  href="https://map.naver.com/p/search/광주광역시%20광산구%20임방울대로%20330%20애플타워"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="네이버 지도에서 위치 보기 (새 창에서 열림)"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#03C75A]/10 text-[#03C75A] hover:bg-[#03C75A]/20 transition-colors text-xs font-medium"
                >
                  <Icon icon="simple-icons:naver" className="w-3 h-3" aria-hidden="true" />
                  네이버
                </a>
                <a
                  href="https://map.kakao.com/?q=광주광역시%20광산구%20임방울대로%20330%20애플타워"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="카카오맵에서 위치 보기 (새 창에서 열림)"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#FEE500]/10 text-[#FEE500] hover:bg-[#FEE500]/20 transition-colors text-xs font-medium"
                >
                  <Icon icon="simple-icons:kakao" className="w-3 h-3" aria-hidden="true" />
                  카카오
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border/60 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 text-xs text-text-subtle">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                <span className="text-text-muted">상호명</span> 스터디코어 1.0
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span>
                <span className="text-text-muted">대표자</span> 정원석
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span>
                <span className="text-text-muted">사업자등록번호</span> 488-29-01855
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <span>
                <span className="text-text-muted">개인정보보호책임자</span> 정원석
              </span>
              <span className="hidden sm:inline text-border">|</span>
              <span>
                <span className="text-text-muted">이메일</span> studycore10@naver.com
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 py-5">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-text-subtle text-xs">© 2025 Study Core 1.0. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs">
              <Link href="/terms" className="text-text-subtle hover:text-primary transition-colors">
                이용약관
              </Link>
              <span className="w-px h-3 bg-border" />
              <Link href="/privacy" className="text-text-subtle hover:text-primary transition-colors">
                개인정보처리방침
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};
