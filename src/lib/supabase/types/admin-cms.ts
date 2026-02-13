// =====================================================
// Admin CMS Types
// =====================================================

export interface PageSection {
  id: string;
  section_key: string;
  field_key: string;
  content: string;
  field_type: 'text' | 'textarea' | 'image' | 'url';
  field_label: string;
  field_help: string | null;
  field_order: number;
  updated_at: string;
  updated_by: string | null;
}

export interface HeroStat {
  id: string;
  sort_order: number;
  stat_value: string;
  stat_label: string;
  icon_name: string;
  is_active: boolean;
  updated_at: string;
}

export interface SpaceSlide {
  id: string;
  sort_order: number;
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
  updated_at: string;
  updated_by: string | null;
}

export interface SystemCard {
  id: string;
  sort_order: number;
  title: string;
  subtitle: string;
  description: string;
  icon_name: string;
  color_theme: 'blue' | 'purple' | 'orange' | 'teal';
  is_active: boolean;
  updated_at: string;
}

export interface OperatingHour {
  id: string;
  schedule_type: 'weekday' | 'weekend';
  schedule_label: string;
  operating_hours: string | null;
  study_hours: string | null;
  badge_color: string;
  sort_order: number;
  is_active: boolean;
  updated_at: string;
}

export interface SectionEditHistory {
  id: string;
  table_name: string;
  record_id: string;
  field_name: string | null;
  old_value: string | null;
  new_value: string | null;
  edited_by: string | null;
  edited_at: string;
}

// Form types for editing
export interface PageSectionUpdate {
  content: string;
}

export interface HeroStatForm {
  stat_value: string;
  stat_label: string;
  icon_name: string;
  is_active: boolean;
}

export interface SpaceSlideForm {
  title: string;
  description: string;
  image_url: string;
  is_active: boolean;
}

export interface SystemCardForm {
  title: string;
  subtitle: string;
  description: string;
  icon_name: string;
  color_theme: 'blue' | 'purple' | 'orange' | 'teal';
  is_active: boolean;
}

export interface OperatingHourForm {
  schedule_label: string;
  operating_hours: string;
  study_hours: string | null;
  badge_color: string;
}
