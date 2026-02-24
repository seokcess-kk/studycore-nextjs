'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { usePageSection } from "@/hooks/usePageSections";
import { useSpaceSlides } from "@/hooks/useSpaceSlides";
import { DEFAULT_SPACE, DEFAULT_SPACE_SLIDES } from "@/lib/section-defaults";

export const SpaceSection = () => {
  const { data: spaceData } = usePageSection('space');
  const { data: spaceSlides } = useSpaceSlides();

  // DB 데이터 또는 기본값 사용
  const space = {
    badge: spaceData?.badge ?? DEFAULT_SPACE.badge,
    title_1: spaceData?.title_1 ?? DEFAULT_SPACE.title_1,
    title_2: spaceData?.title_2 ?? DEFAULT_SPACE.title_2,
    title_3: spaceData?.title_3 ?? DEFAULT_SPACE.title_3,
    description: spaceData?.description ?? DEFAULT_SPACE.description,
  };

  const spaces = useMemo(() => {
    if (spaceSlides && spaceSlides.length > 0) {
      return spaceSlides.map(s => ({
        title: s.title,
        description: s.description,
        image: s.image_url,
      }));
    }
    return DEFAULT_SPACE_SLIDES.map(s => ({
      title: s.title,
      description: s.description,
      image: typeof s.image === 'string' ? s.image : s.image,
    }));
  }, [spaceSlides]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const prevLengthRef = useRef(spaces.length);

  // Touch swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % spaces.length);
  }, [spaces.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + spaces.length) % spaces.length);
  }, [spaces.length]);

  // Reset currentIndex if slides length changes and current index is out of bounds
  useEffect(() => {
    if (prevLengthRef.current !== spaces.length) {
      prevLengthRef.current = spaces.length;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentIndex((prev) => (prev >= spaces.length ? 0 : prev));
    }
  }, [spaces.length]);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  // Touch swipe handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  }, [touchStart, touchEnd, nextSlide, prevSlide]);

  // 키보드 네비게이션 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          prevSlide();
          break;
        case "ArrowRight":
          e.preventDefault();
          nextSlide();
          break;
        case "Home":
          e.preventDefault();
          setCurrentIndex(0);
          break;
        case "End":
          e.preventDefault();
          setCurrentIndex(spaces.length - 1);
          break;
      }
    },
    [nextSlide, prevSlide, spaces.length]
  );

  return (
    <section id="space" className="section-padding relative bg-gradient-to-b from-background via-surface-muted to-background">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-muted border border-primary/20 mb-6">
            <Icon icon="solar:buildings-2-bold" className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm">{space.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-5">
            {space.title_1} <span className="text-gradient">{space.title_2}</span>{space.title_3}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base md:text-lg">
            {space.description}
          </p>
        </motion.div>

        <div
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
          onKeyDown={handleKeyDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          role="region"
          aria-roledescription="carousel"
          aria-label="프리미엄 공간 이미지 캐러셀"
        >
          {/* Main Image */}
          <div className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-2xl border border-border">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0"
              >
                {spaces[currentIndex]?.image && (
                  <Image
                    src={spaces[currentIndex].image}
                    alt={spaces[currentIndex].title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-dark/80 via-surface-dark/20 to-transparent" />
              </motion.div>
            </AnimatePresence>

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full mb-4">
                    {String(currentIndex + 1).padStart(2, "0")} / {String(spaces.length).padStart(2, "0")}
                  </span>
                  <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">{spaces[currentIndex]?.title}</h3>
                  <p className="text-white/90 text-lg max-w-xl">{spaces[currentIndex]?.description}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              aria-label="이전 공간 보기"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/20 transition-all duration-300 flex items-center justify-center group"
            >
              <Icon
                icon="solar:alt-arrow-left-bold"
                className="w-6 h-6 text-white group-hover:-translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </button>
            <button
              onClick={nextSlide}
              aria-label="다음 공간 보기"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/20 transition-all duration-300 flex items-center justify-center group"
            >
              <Icon
                icon="solar:alt-arrow-right-bold"
                className="w-6 h-6 text-white group-hover:translate-x-0.5 transition-transform"
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Thumbnail Navigation */}
          <div
            className="mt-6 flex gap-3 justify-center overflow-x-auto pb-2"
            role="tablist"
            aria-label="공간 이미지 선택"
          >
            {spaces.map((spaceItem, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                role="tab"
                aria-selected={index === currentIndex}
                aria-label={`${spaceItem.title} 보기`}
                tabIndex={index === currentIndex ? 0 : -1}
                className={`relative flex-shrink-0 w-20 h-14 md:w-28 md:h-20 rounded-xl overflow-hidden transition-all duration-300 border-2 ${
                  index === currentIndex
                    ? "border-primary scale-105 shadow-lg"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                {spaceItem.image && (
                  <Image
                    src={spaceItem.image}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
