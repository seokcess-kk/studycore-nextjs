-- =====================================================
-- StudyCore 1.0 Database Schema
-- =====================================================

-- 1. consultations (상담 신청)
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_name TEXT NOT NULL,
  student_phone TEXT NOT NULL,
  parent_phone TEXT,
  school_grade TEXT NOT NULL,
  meal_request TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. notices (공지사항)
CREATE TABLE IF NOT EXISTS notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_published BOOLEAN DEFAULT false,
  show_as_popup BOOLEAN DEFAULT false,
  image_url TEXT,
  image_urls TEXT[] DEFAULT '{}',
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. page_sections (페이지 섹션 CMS)
CREATE TABLE IF NOT EXISTS page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL,
  field_key TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  field_type TEXT DEFAULT 'text',
  field_label TEXT NOT NULL DEFAULT '',
  field_help TEXT,
  field_order INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id),
  UNIQUE(section_key, field_key)
);

-- 4. hero_stats (히어로 섹션 통계)
CREATE TABLE IF NOT EXISTS hero_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order INT DEFAULT 0,
  stat_value TEXT NOT NULL,
  stat_label TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'solar:star-bold',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. space_slides (공간 섹션 슬라이드)
CREATE TABLE IF NOT EXISTS space_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order INT DEFAULT 0,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 6. system_cards (시스템 섹션 카드)
CREATE TABLE IF NOT EXISTS system_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sort_order INT DEFAULT 0,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'solar:star-bold',
  color_theme TEXT DEFAULT 'blue',
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. operating_hours (운영시간)
CREATE TABLE IF NOT EXISTS operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_type TEXT NOT NULL,
  schedule_label TEXT NOT NULL,
  operating_hours TEXT,
  study_hours TEXT,
  badge_color TEXT DEFAULT 'teal',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. section_edit_history (편집 이력)
CREATE TABLE IF NOT EXISTS section_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  edited_by UUID REFERENCES auth.users(id),
  edited_at TIMESTAMPTZ DEFAULT now()
);

-- 9. user_roles (사용자 역할)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 10. site_settings (사이트 설정)
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- RPC Functions
-- =====================================================

-- has_role 함수 (관리자 권한 확인)
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- =====================================================
-- Row Level Security (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE operating_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_edit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read policies (공개 읽기)
CREATE POLICY "Public can read published notices" ON notices
  FOR SELECT USING (is_published = true);

CREATE POLICY "Public can read page_sections" ON page_sections
  FOR SELECT USING (true);

CREATE POLICY "Public can read active hero_stats" ON hero_stats
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active space_slides" ON space_slides
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active system_cards" ON system_cards
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active operating_hours" ON operating_hours
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read site_settings" ON site_settings
  FOR SELECT USING (true);

-- Public insert policy (상담 신청)
CREATE POLICY "Public can insert consultations" ON consultations
  FOR INSERT WITH CHECK (true);

-- Admin policies (관리자 전체 권한)
CREATE POLICY "Admins have full access to consultations" ON consultations
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins have full access to notices" ON notices
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins have full access to page_sections" ON page_sections
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins have full access to hero_stats" ON hero_stats
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins have full access to space_slides" ON space_slides
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins have full access to system_cards" ON system_cards
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins have full access to operating_hours" ON operating_hours
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins have full access to section_edit_history" ON section_edit_history
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins have full access to user_roles" ON user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins have full access to site_settings" ON site_settings
  FOR ALL USING (has_role(auth.uid(), 'admin'));

-- =====================================================
-- Initial Data (기본 데이터)
-- =====================================================

-- Site settings
INSERT INTO site_settings (key, value) VALUES ('show_popup', 'true');

-- Hero section
INSERT INTO page_sections (section_key, field_key, content, field_type, field_label, field_order) VALUES
('hero', 'badge', 'PREMIUM MANAGED STUDY CENTER', 'text', '배지', 1),
('hero', 'headline_1', '학습관리의 첫 번째 완성형', 'text', '헤드라인 1', 2),
('hero', 'headline_2', '스터디코어 1.0', 'text', '헤드라인 2', 3),
('hero', 'description_1', '몰입의 깊이가 다른 프리미엄 관리형 독서실', 'text', '설명 1', 4),
('hero', 'description_2', '체계적인 학습 관리로 최상위권을 향한 여정을 함께합니다', 'text', '설명 2', 5),
('hero', 'cta_primary', '상담 신청하기', 'text', 'CTA 버튼 1', 6),
('hero', 'cta_secondary', '공간 둘러보기', 'text', 'CTA 버튼 2', 7);

-- Hero stats
INSERT INTO hero_stats (sort_order, stat_value, stat_label, icon_name, is_active) VALUES
(1, '100+', '프리미엄 좌석', 'solar:armchair-bold', true),
(2, '24/7', '철저한 관리', 'solar:shield-check-bold', true),
(3, '1:1', '전담 멘토링', 'solar:user-speak-bold', true);

-- Space section
INSERT INTO page_sections (section_key, field_key, content, field_type, field_label, field_order) VALUES
('space', 'badge', 'PREMIUM SPACE', 'text', '배지', 1),
('space', 'title_1', '최고의 성과는', 'text', '제목 1', 2),
('space', 'title_2', '최고의 환경', 'text', '제목 2 (강조)', 3),
('space', 'title_3', '에서', 'text', '제목 3', 4),
('space', 'description', '학습에만 온전히 집중할 수 있도록 설계된 프리미엄 환경', 'text', '설명', 5);

-- Space slides
INSERT INTO space_slides (sort_order, title, description, image_url, is_active) VALUES
(1, '스터디코어 1.0', '학습관리의 첫 번째 완성형 시스템, STUDYCORE 1.0', '/assets/space-entrance.png', true),
(2, '관리 데스크', '체계적인 독서실 관리를 위한 통합 관리 공간', '/assets/space-reception.png', true),
(3, '개인 학습 공간', '학습 최적화 데스크 설계에 기반한 집중 학습 환경', '/assets/space-study.png', true),
(4, '1:1 과외룸', '개인 멘토링 및 프라이빗 학습을 위한 독립된 공간', '/assets/space-rooms.png', true),
(5, '로비 & 게이트', '스마트 출입 관리 시스템이 적용된 현대적인 공간', '/assets/space-lobby.png', true),
(6, '전체 공간 구성', '효율적인 동선과 공부 몰입에 최적화된 학습 환경 설계', '/assets/space-overview.png', true);

-- System section
INSERT INTO page_sections (section_key, field_key, content, field_type, field_label, field_order) VALUES
('system', 'badge', 'MANAGEMENT SYSTEM', 'text', '배지', 1),
('system', 'title', '4대 핵심 관리 시스템', 'text', '제목', 2),
('system', 'description_1', '스터디코어 1.0만의 체계적인 관리 시스템으로', 'text', '설명 1', 3),
('system', 'description_2', '학습의 모든 측면을 관리합니다', 'text', '설명 2', 4);

-- System cards
INSERT INTO system_cards (sort_order, title, subtitle, description, icon_name, color_theme, is_active) VALUES
(1, '생활관리', '출결관리, 휴대폰 수거, 상시 순찰', '집중을 방해하는 모든 요소를 제거하고 철저한 생활 관리로 학습 몰입 환경을 조성합니다.', 'solar:users-group-rounded-bold', 'blue', true),
(2, '학습관리', '최상위권 멘토 1:1 피드백', '개인별 학습 계획을 점검하고 최상위권 멘토의 1:1 피드백으로 학습 효율을 극대화합니다.', 'solar:clipboard-check-bold', 'purple', true),
(3, '교육콘텐츠', '검증된 대치동 학습 자료 제공', '검증된 대치동 학습 자료를 제공하고 취약점 보완 학습 시스템을 운영합니다.', 'solar:book-bookmark-bold', 'orange', true),
(4, '학습환경', '학습 최적화 공간 설계', '인체공학적 데스크와 조명, 공조 시스템으로 최적의 학습 환경을 제공합니다.', 'solar:buildings-3-bold', 'teal', true);

-- Program section
INSERT INTO page_sections (section_key, field_key, content, field_type, field_label, field_order) VALUES
('program', 'badge', 'PROGRAM', 'text', '배지', 1),
('program', 'title', '프로그램 안내', 'text', '제목', 2),
('program', 'status_badge', 'NOW OPEN', 'text', '상태 배지', 3),
('program', 'banner_title', '2026 윈터스쿨 1기 모집', 'text', '배너 제목', 4),
('program', 'banner_desc_1', '겨울방학 동안 체계적인 학습 관리와 함께', 'text', '배너 설명 1', 5),
('program', 'banner_desc_2', '새 학년을 완벽하게 준비하세요', 'text', '배너 설명 2', 6),
('program', 'start_date', '2026년 1월 1일', 'text', '개강일', 7),
('program', 'duration_cost', '2개월 · 68만원', 'text', '기간/비용', 8),
('program', 'capacity', '선착순 30명', 'text', '모집정원', 9),
('program', 'cta_primary', '지금 신청하기', 'text', 'CTA 버튼 1', 10),
('program', 'cta_secondary', '전화 문의', 'text', 'CTA 버튼 2', 11),
('program', 'phone', '01044083790', 'text', '전화번호', 12);

-- Operating hours
INSERT INTO operating_hours (sort_order, schedule_type, schedule_label, operating_hours, study_hours, badge_color, is_active) VALUES
(1, 'weekday', '의무 (월~금)', '08:00 ~ 22:00', '10:00 ~ 22:00', 'teal', true),
(2, 'weekend', '자율 (토, 일, 공휴일)', '10:00 ~ 22:00', NULL, 'cyan', true);
