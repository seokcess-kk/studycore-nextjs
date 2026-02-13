'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { usePageSection } from "@/hooks/usePageSections";
import { useOperatingHours } from "@/hooks/useOperatingHours";
import { DEFAULT_PROGRAM, DEFAULT_OPERATING_HOURS } from "@/lib/section-defaults";

export const ProgramSection = () => {
  const { data: programData } = usePageSection('program');
  const { data: operatingHours } = useOperatingHours();

  // DB 데이터 또는 기본값 사용
  const program = {
    badge: programData?.badge ?? DEFAULT_PROGRAM.badge,
    title: programData?.title ?? DEFAULT_PROGRAM.title,
    status_badge: programData?.status_badge ?? DEFAULT_PROGRAM.status_badge,
    banner_title: programData?.banner_title ?? DEFAULT_PROGRAM.banner_title,
    banner_desc_1: programData?.banner_desc_1 ?? DEFAULT_PROGRAM.banner_desc_1,
    banner_desc_2: programData?.banner_desc_2 ?? DEFAULT_PROGRAM.banner_desc_2,
    start_date: programData?.start_date ?? DEFAULT_PROGRAM.start_date,
    duration_cost: programData?.duration_cost ?? DEFAULT_PROGRAM.duration_cost,
    capacity: programData?.capacity ?? DEFAULT_PROGRAM.capacity,
    cta_primary: programData?.cta_primary ?? DEFAULT_PROGRAM.cta_primary,
    cta_secondary: programData?.cta_secondary ?? DEFAULT_PROGRAM.cta_secondary,
    phone: programData?.phone ?? DEFAULT_PROGRAM.phone,
  };

  const hours = useMemo(() => {
    if (operatingHours && operatingHours.length > 0) {
      return operatingHours;
    }
    return DEFAULT_OPERATING_HOURS;
  }, [operatingHours]);

  return (
    <section
      id="program"
      className="section-padding relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden"
    >
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6">
            <Icon icon="solar:notebook-bold" className="w-4 h-4 text-teal-400" />
            <span className="text-teal-300 text-sm font-semibold">{program.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white">{program.title}</h2>
        </motion.div>

        {/* Winter School Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/20 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-[80px]" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-[60px]" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/20 border border-teal-400/30 rounded-full mb-6">
                <Icon icon="solar:star-shine-bold" className="w-4 h-4 text-teal-300" />
                <span className="text-teal-200 font-bold text-sm">{program.status_badge}</span>
              </div>

              <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
                {program.banner_title}
              </h3>

              <p className="text-slate-300 mb-8 max-w-lg text-base md:text-lg leading-relaxed">
                {program.banner_desc_1}
                <br className="hidden sm:block" />
                {program.banner_desc_2}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {[
                  { icon: "solar:calendar-bold", label: "개강일", value: program.start_date },
                  { icon: "solar:clock-circle-bold", label: "기간 / 비용", value: program.duration_cost },
                  { icon: "solar:users-group-two-rounded-bold", label: "모집정원", value: program.capacity },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl p-4"
                  >
                    <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center flex-shrink-0">
                      <Icon icon={item.icon} className="w-5 h-5 text-teal-300" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-slate-400 mb-0.5">{item.label}</p>
                      <p className="text-white font-bold text-sm md:text-base truncate">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-teal-400 text-white hover:shadow-2xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-300 px-8 py-6 text-base font-bold rounded-xl"
                >
                  <a href="#contact" className="flex items-center gap-2">
                    {program.cta_primary}
                    <Icon icon="solar:arrow-right-bold" className="w-5 h-5" />
                  </a>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white/30 text-white bg-transparent hover:bg-white/10 hover:border-white/50 px-8 py-6 text-base font-semibold rounded-xl"
                >
                  <a href={`tel:${program.phone}`} className="flex items-center gap-2">
                    <Icon icon="solar:phone-calling-bold" className="w-5 h-5" />
                    {program.cta_secondary}
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Operating Hours Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="max-w-4xl mx-auto mt-6"
        >
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-white/20">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center">
                <Icon icon="solar:clock-circle-bold" className="w-5 h-5 text-teal-300" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white">이용시간 안내</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {hours.map((hour) => {
                const isWeekday = hour.schedule_type === 'weekday';
                const badgeClass = isWeekday
                  ? 'bg-teal-500/20 border-teal-400/30'
                  : 'bg-cyan-500/20 border-cyan-400/30';
                const textClass = isWeekday ? 'text-teal-200' : 'text-cyan-200';

                return (
                  <div key={hour.schedule_type} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 ${badgeClass} rounded-full mb-4`}>
                      <span className={`${textClass} font-bold text-sm`}>{hour.schedule_label}</span>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 text-sm">운영 시간</span>
                        <span className="text-white font-semibold">{hour.operating_hours}</span>
                      </div>
                      {hour.study_hours && (
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-sm">학습 시간</span>
                          <span className="text-white font-semibold">{hour.study_hours}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
