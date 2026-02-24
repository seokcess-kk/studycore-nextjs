'use client';

import { useState } from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

// Korean phone number regex: 01X-XXXX-XXXX or 01XXXXXXXXX format
const koreanPhoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;

const consultationSchema = z.object({
  studentName: z.string().min(1, "학생 이름을 입력해주세요").max(50),
  studentPhone: z
    .string()
    .min(10, "올바른 연락처를 입력해주세요")
    .max(15)
    .regex(koreanPhoneRegex, "올바른 전화번호 형식을 입력해주세요 (예: 010-1234-5678)"),
  parentPhone: z
    .string()
    .max(15)
    .refine((val) => !val || koreanPhoneRegex.test(val), "올바른 전화번호 형식을 입력해주세요")
    .optional(),
  schoolGrade: z.string().min(1, "학교/학년을 입력해주세요").max(100),
  mealRequest: z.string(),
  privacyConsent: z.boolean().refine((val) => val === true, "개인정보 수집에 동의해주세요"),
});

const mealOptions = [
  { value: "신청 안함", label: "신청 안함" },
  { value: "점심", label: "점심" },
  { value: "저녁", label: "저녁" },
  { value: "점심/저녁", label: "점심/저녁" },
];

export const ContactSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    studentName: "",
    studentPhone: "",
    parentPhone: "",
    schoolGrade: "",
    mealRequest: "신청 안함",
    privacyConsent: false,
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // 실시간 유효성 검사
  const validateField = (name: string, value: string | boolean) => {
    let error = "";

    switch (name) {
      case "studentName":
        if (typeof value === "string" && value.length === 0) {
          error = "학생 이름을 입력해주세요";
        } else if (typeof value === "string" && value.length > 50) {
          error = "이름은 50자 이내로 입력해주세요";
        }
        break;
      case "studentPhone":
        if (typeof value === "string") {
          if (value.length === 0) {
            error = "연락처를 입력해주세요";
          } else if (!koreanPhoneRegex.test(value)) {
            error = "올바른 형식: 010-1234-5678";
          }
        }
        break;
      case "parentPhone":
        if (typeof value === "string" && value.length > 0 && !koreanPhoneRegex.test(value)) {
          error = "올바른 형식: 010-1234-5678";
        }
        break;
      case "schoolGrade":
        if (typeof value === "string" && value.length === 0) {
          error = "학교/학년을 입력해주세요";
        }
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleBlur = (name: string) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, formData[name as keyof typeof formData]);
  };

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = consultationSchema.safeParse(formData);
    if (!result.success) {
      toast.error(result.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.from("consultations").insert({
      student_name: formData.studentName,
      student_phone: formData.studentPhone,
      parent_phone: formData.parentPhone || null,
      school_grade: formData.schoolGrade,
      meal_request: formData.mealRequest,
      privacy_consent: formData.privacyConsent,
    });

    setIsSubmitting(false);

    if (error) {
      toast.error("상담 신청 중 문제가 발생했습니다. 다시 시도해주세요.");
      return;
    }

    toast.success("상담 신청이 완료되었습니다. 빠른 시일 내에 연락드리겠습니다.");

    setFormData({
      studentName: "",
      studentPhone: "",
      parentPhone: "",
      schoolGrade: "",
      mealRequest: "신청 안함",
      privacyConsent: false,
    });
  };

  return (
    <section id="contact" className="section-padding relative bg-surface-dark overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-cyan/20 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
            <Icon icon="solar:chat-round-dots-bold" className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-semibold">CONTACT</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-text-on-dark mb-6">상담 신청</h2>
          <p className="text-text-muted max-w-lg mx-auto">
            궁금한 점이 있으시면 언제든 문의해주세요. 친절하게 안내해드립니다.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          {/* Form - Full width at top */}
          <motion.div
            id="news"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-card rounded-3xl p-8 md:p-10 shadow-2xl mb-8"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-brand-cyan flex items-center justify-center">
                <Icon icon="solar:document-add-bold" className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-card-foreground">상담 신청서</h3>
                <p className="text-sm text-muted-foreground">아래 양식을 작성해주세요</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="studentName" className="text-card-foreground font-semibold flex items-center gap-2 mb-2">
                    <Icon icon="solar:user-bold" className="w-4 h-4 text-primary" />
                    학생 이름 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="studentName"
                    value={formData.studentName}
                    onChange={(e) => handleChange("studentName", e.target.value)}
                    onBlur={() => handleBlur("studentName")}
                    aria-invalid={touched.studentName && !!fieldErrors.studentName}
                    aria-describedby={fieldErrors.studentName ? "studentName-error" : undefined}
                    className={`bg-secondary border-border focus:border-primary focus:ring-ring/20 rounded-xl py-6 ${
                      touched.studentName && fieldErrors.studentName ? "border-destructive focus:border-destructive" : ""
                    }`}
                    placeholder="홍길동"
                  />
                  {touched.studentName && fieldErrors.studentName && (
                    <p id="studentName-error" className="text-destructive text-sm mt-1.5 flex items-center gap-1">
                      <Icon icon="solar:danger-circle-bold" className="w-3 h-3" />
                      {fieldErrors.studentName}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="schoolGrade" className="text-card-foreground font-semibold flex items-center gap-2 mb-2">
                    <Icon icon="solar:diploma-bold" className="w-4 h-4 text-primary" />
                    학교/학년 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="schoolGrade"
                    value={formData.schoolGrade}
                    onChange={(e) => handleChange("schoolGrade", e.target.value)}
                    onBlur={() => handleBlur("schoolGrade")}
                    aria-invalid={touched.schoolGrade && !!fieldErrors.schoolGrade}
                    aria-describedby={fieldErrors.schoolGrade ? "schoolGrade-error" : undefined}
                    className={`bg-secondary border-border focus:border-primary focus:ring-ring/20 rounded-xl py-6 ${
                      touched.schoolGrade && fieldErrors.schoolGrade ? "border-destructive focus:border-destructive" : ""
                    }`}
                    placeholder="예) OO고등학교 2학년"
                  />
                  {touched.schoolGrade && fieldErrors.schoolGrade && (
                    <p id="schoolGrade-error" className="text-destructive text-sm mt-1.5 flex items-center gap-1">
                      <Icon icon="solar:danger-circle-bold" className="w-3 h-3" />
                      {fieldErrors.schoolGrade}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="studentPhone" className="text-card-foreground font-semibold flex items-center gap-2 mb-2">
                    <Icon icon="solar:phone-bold" className="w-4 h-4 text-primary" />
                    학생 연락처 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="studentPhone"
                    type="tel"
                    value={formData.studentPhone}
                    onChange={(e) => handleChange("studentPhone", e.target.value)}
                    onBlur={() => handleBlur("studentPhone")}
                    aria-invalid={touched.studentPhone && !!fieldErrors.studentPhone}
                    aria-describedby={fieldErrors.studentPhone ? "studentPhone-error" : undefined}
                    className={`bg-secondary border-border focus:border-primary focus:ring-ring/20 rounded-xl py-6 ${
                      touched.studentPhone && fieldErrors.studentPhone ? "border-destructive focus:border-destructive" : ""
                    }`}
                    placeholder="010-0000-0000"
                  />
                  {touched.studentPhone && fieldErrors.studentPhone && (
                    <p id="studentPhone-error" className="text-destructive text-sm mt-1.5 flex items-center gap-1">
                      <Icon icon="solar:danger-circle-bold" className="w-3 h-3" />
                      {fieldErrors.studentPhone}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="parentPhone" className="text-card-foreground font-semibold flex items-center gap-2 mb-2">
                    <Icon icon="solar:phone-calling-bold" className="w-4 h-4 text-primary" />
                    학부모 연락처
                  </Label>
                  <Input
                    id="parentPhone"
                    type="tel"
                    value={formData.parentPhone}
                    onChange={(e) => handleChange("parentPhone", e.target.value)}
                    onBlur={() => handleBlur("parentPhone")}
                    aria-invalid={touched.parentPhone && !!fieldErrors.parentPhone}
                    aria-describedby={fieldErrors.parentPhone ? "parentPhone-error" : undefined}
                    className={`bg-secondary border-border focus:border-primary focus:ring-ring/20 rounded-xl py-6 ${
                      touched.parentPhone && fieldErrors.parentPhone ? "border-destructive focus:border-destructive" : ""
                    }`}
                    placeholder="010-0000-0000"
                  />
                  {touched.parentPhone && fieldErrors.parentPhone && (
                    <p id="parentPhone-error" className="text-destructive text-sm mt-1.5 flex items-center gap-1">
                      <Icon icon="solar:danger-circle-bold" className="w-3 h-3" />
                      {fieldErrors.parentPhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center gap-4 py-4 px-5 bg-secondary rounded-xl">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm text-muted-foreground flex items-center gap-2 whitespace-nowrap">
                      <Icon icon="solar:chef-hat-bold" className="w-4 h-4 text-muted-foreground" />
                      도시락 신청
                    </Label>
                    <Select
                      value={formData.mealRequest}
                      onValueChange={(value) => setFormData({ ...formData, mealRequest: value })}
                    >
                      <SelectTrigger className="w-[130px] bg-card border-border focus:border-primary focus:ring-ring/20 rounded-lg">
                        <SelectValue placeholder="선택" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border z-50">
                        {mealOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">수요조사이며, 정식 신청은 별도 안내됩니다.</p>
                </div>
                <br />
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacyConsent"
                    checked={formData.privacyConsent}
                    onCheckedChange={(checked) => setFormData({ ...formData, privacyConsent: checked as boolean })}
                    className="border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary mt-0.5"
                  />
                  <div className="flex flex-wrap items-center gap-1">
                    <Label htmlFor="privacyConsent" className="text-sm text-muted-foreground cursor-pointer">
                      <span className="text-red-500 font-semibold">[필수]</span> 개인정보 수집 및 이용에 동의합니다.
                    </Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-primary text-sm hover:underline">
                          (내용 보기)
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-card">
                        <DialogHeader>
                          <DialogTitle className="text-lg font-bold text-card-foreground">
                            개인정보 수집 및 이용 동의
                          </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="max-h-[60vh] pr-4">
                          <div className="text-sm text-muted-foreground space-y-4">
                            <section>
                              <h3 className="font-semibold text-card-foreground mb-2">1. 수집하는 개인정보 항목</h3>
                              <p>• 필수항목: 학생 이름, 학교/학년, 학생 연락처</p>
                              <p>• 선택항목: 학부모 연락처, 급식 신청 여부</p>
                            </section>
                            <section>
                              <h3 className="font-semibold text-card-foreground mb-2">2. 개인정보의 수집 및 이용 목적</h3>
                              <p>• 상담 신청 및 문의에 대한 응대</p>
                              <p>• 서비스 제공 및 이용자 관리</p>
                            </section>
                            <section>
                              <h3 className="font-semibold text-card-foreground mb-2">3. 개인정보의 보유 및 이용 기간</h3>
                              <p>
                                수집된 개인정보는 수집 목적이 달성된 후 지체 없이 파기합니다. 단, 관련 법령에 따라
                                보존이 필요한 경우 해당 기간 동안 보관합니다.
                              </p>
                            </section>
                            <section>
                              <h3 className="font-semibold text-card-foreground mb-2">4. 동의 거부권 및 불이익</h3>
                              <p>
                                귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만, 필수 항목에
                                대한 동의를 거부하실 경우 상담 신청이 제한됩니다.
                              </p>
                            </section>
                          </div>
                        </ScrollArea>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto sm:px-14 bg-gradient-to-r from-primary to-primary-hover text-primary-foreground hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 transition-all duration-300 py-6 text-base font-bold rounded-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <Icon icon="solar:refresh-bold" className="w-5 h-5 animate-spin" />
                    신청 중...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Icon icon="solar:plain-bold" className="w-5 h-5" />
                    상담 신청하기
                  </span>
                )}
              </Button>
            </form>
          </motion.div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-6"
          >
            {/* Map Header with External Links */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-brand-cyan flex items-center justify-center">
                  <Icon icon="solar:map-point-bold" className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-on-dark">오시는 길</h3>
                  <p className="text-sm text-text-muted">광주광역시 광산구 임방울대로 330 애플타워 10층</p>
                </div>
              </div>

              {/* Map Links */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="https://map.naver.com/p/search/광주광역시%20광산구%20임방울대로%20330%20애플타워"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#03C75A]/10 border border-[#03C75A]/30 text-[#03C75A] hover:bg-[#03C75A]/20 transition-all duration-300 text-xs font-semibold"
                >
                  <Icon icon="simple-icons:naver" className="w-3.5 h-3.5" />
                  네이버
                </a>
                <a
                  href="https://map.kakao.com/?q=광주광역시%20광산구%20임방울대로%20330%20애플타워"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#FEE500]/10 border border-[#FEE500]/30 text-[#FEE500] hover:bg-[#FEE500]/20 transition-all duration-300 text-xs font-semibold"
                >
                  <Icon icon="simple-icons:kakao" className="w-3.5 h-3.5" />
                  카카오
                </a>
                <a
                  href="https://maps.google.com/maps?q=광주광역시+광산구+임방울대로+330+애플타워"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#4285F4]/10 border border-[#4285F4]/30 text-[#4285F4] hover:bg-[#4285F4]/20 transition-all duration-300 text-xs font-semibold"
                >
                  <Icon icon="simple-icons:googlemaps" className="w-3.5 h-3.5" />
                  구글
                </a>
              </div>
            </div>

            {/* Google Maps Embed */}
            <div className="rounded-2xl overflow-hidden border border-border/50 shadow-lg h-[300px]">
              <iframe
                title="Study Core Location"
                className="w-full h-full grayscale-[0.3] hover:grayscale-0 transition-all duration-500"
                src="https://maps.google.com/maps?q=광주광역시+광산구+임방울대로+330+애플타워&t=&z=17&ie=UTF8&iwloc=&output=embed"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
