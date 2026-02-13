'use client';

import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { usePageSection } from "@/hooks/usePageSections";
import { useHeroStats } from "@/hooks/useHeroStats";
import { DEFAULT_HERO, DEFAULT_HERO_STATS } from "@/lib/section-defaults";

export const HeroSection = () => {
  const { data: heroData } = usePageSection('hero');
  const { data: heroStats } = useHeroStats();

  // DB 데이터 또는 기본값 사용
  const hero = {
    badge: heroData?.badge ?? DEFAULT_HERO.badge,
    headline_1: heroData?.headline_1 ?? DEFAULT_HERO.headline_1,
    headline_2: heroData?.headline_2 ?? DEFAULT_HERO.headline_2,
    description_1: heroData?.description_1 ?? DEFAULT_HERO.description_1,
    description_2: heroData?.description_2 ?? DEFAULT_HERO.description_2,
    cta_primary: heroData?.cta_primary ?? DEFAULT_HERO.cta_primary,
    cta_secondary: heroData?.cta_secondary ?? DEFAULT_HERO.cta_secondary,
  };

  const stats = heroStats && heroStats.length > 0
    ? heroStats.map(s => ({ value: s.stat_value, label: s.stat_label, icon: s.icon_name }))
    : DEFAULT_HERO_STATS.map(s => ({ value: s.stat_value, label: s.stat_label, icon: s.icon_name }));

  return (
    <section id="about" className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/assets/space-entrance.png"
          alt="Study Core 1.0"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-slate-900/50 to-slate-900/90" />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-400/15 rounded-full blur-[100px]" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-4 relative z-10 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-500/20 border border-teal-400/30 mb-10"
          >
            <Icon icon="solar:star-bold" className="w-4 h-4 text-teal-400" />
            <span className="text-teal-300 text-sm font-semibold tracking-wide">{hero.badge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-8 leading-[1.15]"
          >
            {hero.headline_1}
            <br />
            <span className="text-gradient">{hero.headline_2}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg md:text-xl text-slate-300/90 mb-14 max-w-xl mx-auto leading-relaxed"
          >
            {hero.description_1}
            <br />
            {hero.description_2}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              asChild
              size="lg"
              className="btn-primary text-base px-10 py-6 rounded-xl"
            >
              <a href="#contact" className="flex items-center gap-2">
                <Icon icon="solar:chat-round-call-bold" className="w-5 h-5" />
                {hero.cta_primary}
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white/30 text-white bg-white/5 hover:bg-white/10 hover:border-white/50 text-base px-10 py-6 rounded-xl backdrop-blur-sm"
            >
              <a href="#space" className="flex items-center gap-2">
                <Icon icon="solar:buildings-2-bold" className="w-5 h-5" />
                {hero.cta_secondary}
              </a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-20 grid grid-cols-3 gap-4 md:gap-12 max-w-lg mx-auto"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                    <Icon icon={stat.icon} className="w-5 h-5 text-teal-400" />
                  </div>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-gradient mb-1">{stat.value}</p>
                <p className="text-xs md:text-sm text-slate-400 font-medium">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
