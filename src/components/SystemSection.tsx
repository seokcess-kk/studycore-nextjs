'use client';

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { usePageSection } from "@/hooks/usePageSections";
import { useSystemCards } from "@/hooks/useSystemCards";
import { DEFAULT_SYSTEM, DEFAULT_SYSTEM_CARDS } from "@/lib/section-defaults";

const colorMap: Record<string, { color: string; bgColor: string; textColor: string }> = {
  blue: { color: "bg-blue-500", bgColor: "bg-blue-50", textColor: "text-blue-600" },
  purple: { color: "bg-purple-500", bgColor: "bg-purple-50", textColor: "text-purple-600" },
  orange: { color: "bg-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-600" },
  teal: { color: "bg-teal-500", bgColor: "bg-teal-50", textColor: "text-teal-600" },
};

export const SystemSection = () => {
  const { data: systemData } = usePageSection('system');
  const { data: systemCards } = useSystemCards();

  // DB 데이터 또는 기본값 사용
  const system = {
    badge: systemData?.badge ?? DEFAULT_SYSTEM.badge,
    title: systemData?.title ?? DEFAULT_SYSTEM.title,
    description_1: systemData?.description_1 ?? DEFAULT_SYSTEM.description_1,
    description_2: systemData?.description_2 ?? DEFAULT_SYSTEM.description_2,
  };

  const systems = useMemo(() => {
    if (systemCards && systemCards.length > 0) {
      return systemCards.map(card => {
        const colors = colorMap[card.color_theme] || colorMap.blue;
        return {
          icon: card.icon_name,
          title: card.title,
          description: card.subtitle,
          details: card.description,
          ...colors,
        };
      });
    }
    return DEFAULT_SYSTEM_CARDS.map(card => {
      const colors = colorMap[card.color_theme] || colorMap.blue;
      return {
        icon: card.icon_name,
        title: card.title,
        description: card.subtitle,
        details: card.description,
        ...colors,
      };
    });
  }, [systemCards]);

  return (
    <section id="system" className="section-padding relative bg-gradient-to-b from-white via-slate-50/50 to-white">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 border border-teal-200 mb-6">
            <Icon icon="solar:settings-bold" className="w-4 h-4 text-teal-600" />
            <span className="text-teal-700 text-sm font-semibold">{system.badge}</span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-5">
            {system.title}
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-base md:text-lg">
            {system.description_1}
            <br className="hidden sm:block" />
            {system.description_2}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {systems.map((systemItem, index) => (
            <motion.div
              key={systemItem.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative bg-white rounded-2xl p-7 border border-slate-200 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-2xl ${systemItem.bgColor} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <Icon icon={systemItem.icon} className={`w-7 h-7 ${systemItem.textColor}`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {systemItem.title}
              </h3>
              <p className={`text-sm font-semibold mb-3 ${systemItem.textColor}`}>
                {systemItem.description}
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                {systemItem.details}
              </p>

              {/* Hover accent line */}
              <div className={`absolute bottom-0 left-0 right-0 h-1 ${systemItem.color} rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
