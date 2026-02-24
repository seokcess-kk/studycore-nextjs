-- =====================================================
-- StudyCore 1.0 - Complete Database Schema
-- Generated: 2026-02-24
-- =====================================================
-- =====================================================
-- 1. Enums
-- =====================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
-- =====================================================
-- 2. Tables
-- =====================================================
-- User Roles
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);
-- Consultations (상담 신청)
CREATE TABLE public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name TEXT NOT NULL,
    student_phone TEXT NOT NULL,
    parent_phone TEXT,
    school_grade TEXT NOT NULL,
    meal_request TEXT DEFAULT '신청 안함',
    privacy_consent BOOLEAN NOT NULL DEFAULT false,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Notices (공지사항)
CREATE TABLE public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    image_urls TEXT[] DEFAULT '{}'::text[],
    attachment_url TEXT,
    attachment_name TEXT,
    is_published BOOLEAN DEFAULT true,
    show_as_popup BOOLEAN NOT NULL DEFAULT false,
    view_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Site Settings (사이트 설정)
CREATE TABLE public.site_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Page Sections (페이지 섹션 콘텐츠)
CREATE TABLE public.page_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    section_key TEXT NOT NULL,
    field_key TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    field_type TEXT NOT NULL DEFAULT 'text',
    field_label TEXT NOT NULL DEFAULT '',
    field_help TEXT,
    field_order INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID,
    UNIQUE (section_key, field_key)
);
-- Hero Stats (히어로 통계)
CREATE TABLE public.hero_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sort_order INTEGER NOT NULL DEFAULT 0,
    stat_value TEXT NOT NULL DEFAULT '',
    stat_label TEXT NOT NULL DEFAULT '',
    icon_name TEXT NOT NULL DEFAULT 'Star',
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Space Slides (공간 슬라이드)
CREATE TABLE public.space_slides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sort_order INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT NOT NULL DEFAULT '',
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID
);
-- System Cards (관리 시스템 카드)
CREATE TABLE public.system_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sort_order INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL DEFAULT '',
    subtitle TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    icon_name TEXT NOT NULL DEFAULT 'Star',
    color_theme TEXT NOT NULL DEFAULT 'blue',
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Operating Hours (운영 시간)
CREATE TABLE public.operating_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    schedule_type TEXT NOT NULL DEFAULT 'weekday',
    schedule_label TEXT NOT NULL DEFAULT '',
    operating_hours TEXT,
    study_hours TEXT,
    badge_color TEXT NOT NULL DEFAULT 'blue',
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Section Edit History (수정 이력)
CREATE TABLE public.section_edit_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    edited_by UUID,
    edited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- =====================================================
-- 3. Functions
-- =====================================================
-- Role 확인 함수 (RLS에서 사용)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;
-- 공지사항 조회수 증가 함수
CREATE OR REPLACE FUNCTION public.increment_notice_view_count(notice_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.notices
  SET view_count = view_count + 1
  WHERE id = notice_id;
END;
$$;
-- 팝업 공지 단일 보장 트리거 함수
CREATE OR REPLACE FUNCTION public.ensure_single_popup_notice()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.show_as_popup = true THEN
    UPDATE public.notices
    SET show_as_popup = false
    WHERE id != NEW.id AND show_as_popup = true;
  END IF;
  RETURN NEW;
END;
$$;
-- =====================================================
-- 4. Triggers
-- =====================================================
CREATE TRIGGER ensure_single_popup
  BEFORE INSERT OR UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_popup_notice();
-- =====================================================
-- 5. Row Level Security (RLS)
-- =====================================================
-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.section_edit_history ENABLE ROW LEVEL SECURITY;
-- ----- user_roles -----
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Only admins can insert roles" ON public.user_roles
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can update roles" ON public.user_roles
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Only admins can delete roles" ON public.user_roles
  FOR DELETE USING (has_role(auth.uid(), 'admin'));
-- ----- consultations -----
CREATE POLICY "Anyone can submit consultation" ON public.consultations
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view consultations" ON public.consultations
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update consultations" ON public.consultations
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete consultations" ON public.consultations
  FOR DELETE USING (has_role(auth.uid(), 'admin'));
-- ----- notices -----
CREATE POLICY "Anyone can read published notices" ON public.notices
  FOR SELECT USING (is_published = true);
CREATE POLICY "Admins can view all notices" ON public.notices
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert notices" ON public.notices
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update notices" ON public.notices
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete notices" ON public.notices
  FOR DELETE USING (has_role(auth.uid(), 'admin'));
-- ----- site_settings -----
CREATE POLICY "Anyone can read site settings" ON public.site_settings
  FOR SELECT USING (true);
CREATE POLICY "Admins can update site_settings" ON public.site_settings
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
-- ----- page_sections -----
CREATE POLICY "Anyone can read page_sections" ON public.page_sections
  FOR SELECT USING (true);
CREATE POLICY "Admins can update page_sections" ON public.page_sections
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
-- ----- hero_stats -----
CREATE POLICY "Anyone can read active hero_stats" ON public.hero_stats
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can read all hero_stats" ON public.hero_stats
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert hero_stats" ON public.hero_stats
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update hero_stats" ON public.hero_stats
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete hero_stats" ON public.hero_stats
  FOR DELETE USING (has_role(auth.uid(), 'admin'));
-- ----- space_slides -----
CREATE POLICY "Anyone can read active space_slides" ON public.space_slides
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can read all space_slides" ON public.space_slides
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert space_slides" ON public.space_slides
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update space_slides" ON public.space_slides
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete space_slides" ON public.space_slides
  FOR DELETE USING (has_role(auth.uid(), 'admin'));
-- ----- system_cards -----
CREATE POLICY "Anyone can read active system_cards" ON public.system_cards
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can read all system_cards" ON public.system_cards
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert system_cards" ON public.system_cards
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update system_cards" ON public.system_cards
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete system_cards" ON public.system_cards
  FOR DELETE USING (has_role(auth.uid(), 'admin'));
-- ----- operating_hours -----
CREATE POLICY "Anyone can read active operating_hours" ON public.operating_hours
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can read all operating_hours" ON public.operating_hours
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update operating_hours" ON public.operating_hours
  FOR UPDATE USING (has_role(auth.uid(), 'admin'));
-- ----- section_edit_history -----
CREATE POLICY "Admins can read edit_history" ON public.section_edit_history
  FOR SELECT USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert edit_history" ON public.section_edit_history
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'));
-- =====================================================
-- 6. Storage Buckets
-- =====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('notice-attachments', 'notice-attachments', true);
-- =====================================================
-- 7. Indexes (성능 최적화)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_page_sections_key ON public.page_sections (section_key, field_key);
CREATE INDEX IF NOT EXISTS idx_hero_stats_order ON public.hero_stats (sort_order);
CREATE INDEX IF NOT EXISTS idx_space_slides_order ON public.space_slides (sort_order);
CREATE INDEX IF NOT EXISTS idx_system_cards_order ON public.system_cards (sort_order);
CREATE INDEX IF NOT EXISTS idx_operating_hours_order ON public.operating_hours (sort_order);
CREATE INDEX IF NOT EXISTS idx_section_edit_history_table ON public.section_edit_history (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_notices_published ON public.notices (is_published);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations (status);