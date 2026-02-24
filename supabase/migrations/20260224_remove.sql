-- =====================================================
-- StudyCore 1.0 Database Reset & Initialize
-- WARNING: This will DELETE all existing data!
-- =====================================================

-- =====================================================
-- 1. Drop all existing tables (reverse dependency order)
-- =====================================================

-- Drop policies first (if they exist)
DROP POLICY IF EXISTS "Public can read published notices" ON notices;
DROP POLICY IF EXISTS "Public can read page_sections" ON page_sections;
DROP POLICY IF EXISTS "Public can read active hero_stats" ON hero_stats;
DROP POLICY IF EXISTS "Public can read active space_slides" ON space_slides;
DROP POLICY IF EXISTS "Public can read active system_cards" ON system_cards;
DROP POLICY IF EXISTS "Public can read active operating_hours" ON operating_hours;
DROP POLICY IF EXISTS "Public can read site_settings" ON site_settings;
DROP POLICY IF EXISTS "Public can insert consultations" ON consultations;
DROP POLICY IF EXISTS "Admins have full access to consultations" ON consultations;
DROP POLICY IF EXISTS "Admins have full access to notices" ON notices;
DROP POLICY IF EXISTS "Admins have full access to page_sections" ON page_sections;
DROP POLICY IF EXISTS "Admins have full access to hero_stats" ON hero_stats;
DROP POLICY IF EXISTS "Admins have full access to space_slides" ON space_slides;
DROP POLICY IF EXISTS "Admins have full access to system_cards" ON system_cards;
DROP POLICY IF EXISTS "Admins have full access to operating_hours" ON operating_hours;
DROP POLICY IF EXISTS "Admins have full access to section_edit_history" ON section_edit_history;
DROP POLICY IF EXISTS "Admins have full access to user_roles" ON user_roles;
DROP POLICY IF EXISTS "Admins have full access to site_settings" ON site_settings;

-- Drop function
DROP FUNCTION IF EXISTS has_role(UUID, TEXT);

-- Drop tables (order matters due to foreign key constraints)
DROP TABLE IF EXISTS section_edit_history CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS consultations CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS page_sections CASCADE;
DROP TABLE IF EXISTS hero_stats CASCADE;
DROP TABLE IF EXISTS space_slides CASCADE;
DROP TABLE IF EXISTS system_cards CASCADE;
DROP TABLE IF EXISTS operating_hours CASCADE;
DROP TABLE IF EXISTS site_settings CASCADE;