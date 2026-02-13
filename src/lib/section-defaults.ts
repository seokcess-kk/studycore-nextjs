// =====================================================
// Section Defaults - 하드코딩 폴백 값
// DB 조회 실패 시 사용
// =====================================================

export const DEFAULT_HERO = {
  badge: 'PREMIUM MANAGED STUDY CENTER',
  headline_1: '학습관리의 첫 번째 완성형',
  headline_2: '스터디코어 1.0',
  description_1: '몰입의 깊이가 다른 프리미엄 관리형 독서실',
  description_2: '체계적인 학습 관리로 최상위권을 향한 여정을 함께합니다',
  cta_primary: '상담 신청하기',
  cta_secondary: '공간 둘러보기',
};

export const DEFAULT_HERO_STATS = [
  { stat_value: '100+', stat_label: '프리미엄 좌석', icon_name: 'solar:armchair-bold' },
  { stat_value: '24/7', stat_label: '철저한 관리', icon_name: 'solar:shield-check-bold' },
  { stat_value: '1:1', stat_label: '전담 멘토링', icon_name: 'solar:user-speak-bold' },
];

export const DEFAULT_SPACE = {
  badge: 'PREMIUM SPACE',
  title_1: '최고의 성과는',
  title_2: '최고의 환경',
  title_3: '에서',
  description: '학습에만 온전히 집중할 수 있도록 설계된 프리미엄 환경',
};

export const DEFAULT_SPACE_SLIDES = [
  { title: '스터디코어 1.0', description: '학습관리의 첫 번째 완성형 시스템, STUDYCORE 1.0', image: '/assets/space-entrance.png' },
  { title: '관리 데스크', description: '체계적인 독서실 관리를 위한 통합 관리 공간', image: '/assets/space-reception.png' },
  { title: '개인 학습 공간', description: '학습 최적화 데스크 설계에 기반한 집중 학습 환경', image: '/assets/space-study.png' },
  { title: '1:1 과외룸', description: '개인 멘토링 및 프라이빗 학습을 위한 독립된 공간', image: '/assets/space-rooms.png' },
  { title: '로비 & 게이트', description: '스마트 출입 관리 시스템이 적용된 현대적인 공간', image: '/assets/space-lobby.png' },
  { title: '전체 공간 구성', description: '효율적인 동선과 공부 몰입에 최적화된 학습 환경 설계', image: '/assets/space-overview.png' },
];

export const DEFAULT_SYSTEM = {
  badge: 'MANAGEMENT SYSTEM',
  title: '4대 핵심 관리 시스템',
  description_1: '스터디코어 1.0만의 체계적인 관리 시스템으로',
  description_2: '학습의 모든 측면을 관리합니다',
};

export const DEFAULT_SYSTEM_CARDS = [
  {
    title: '생활관리',
    subtitle: '출결관리, 휴대폰 수거, 상시 순찰',
    description: '집중을 방해하는 모든 요소를 제거하고 철저한 생활 관리로 학습 몰입 환경을 조성합니다.',
    icon_name: 'solar:users-group-rounded-bold',
    color_theme: 'blue' as const
  },
  {
    title: '학습관리',
    subtitle: '최상위권 멘토 1:1 피드백',
    description: '개인별 학습 계획을 점검하고 최상위권 멘토의 1:1 피드백으로 학습 효율을 극대화합니다.',
    icon_name: 'solar:clipboard-check-bold',
    color_theme: 'purple' as const
  },
  {
    title: '교육콘텐츠',
    subtitle: '검증된 대치동 학습 자료 제공',
    description: '검증된 대치동 학습 자료를 제공하고 취약점 보완 학습 시스템을 운영합니다.',
    icon_name: 'solar:book-bookmark-bold',
    color_theme: 'orange' as const
  },
  {
    title: '학습환경',
    subtitle: '학습 최적화 공간 설계',
    description: '인체공학적 데스크와 조명, 공조 시스템으로 최적의 학습 환경을 제공합니다.',
    icon_name: 'solar:buildings-3-bold',
    color_theme: 'teal' as const
  },
];

export const DEFAULT_PROGRAM = {
  badge: 'PROGRAM',
  title: '프로그램 안내',
  status_badge: 'NOW OPEN',
  banner_title: '2026 윈터스쿨 1기 모집',
  banner_desc_1: '겨울방학 동안 체계적인 학습 관리와 함께',
  banner_desc_2: '새 학년을 완벽하게 준비하세요',
  start_date: '2026년 1월 1일',
  duration_cost: '2개월 · 68만원',
  capacity: '선착순 30명',
  cta_primary: '지금 신청하기',
  cta_secondary: '전화 문의',
  phone: '01044083790',
};

export const DEFAULT_OPERATING_HOURS = [
  {
    schedule_type: 'weekday' as const,
    schedule_label: '의무 (월~금)',
    operating_hours: '08:00 ~ 22:00',
    study_hours: '10:00 ~ 22:00',
    badge_color: 'teal'
  },
  {
    schedule_type: 'weekend' as const,
    schedule_label: '자율 (토, 일, 공휴일)',
    operating_hours: '10:00 ~ 22:00',
    study_hours: null,
    badge_color: 'cyan'
  },
];
