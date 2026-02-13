/**
 * 사용자 친화적 에러 메시지 시스템
 * PDCA: ui-ux-improvements Phase 2 - UX Enhancement
 */

export interface ErrorMessage {
  title: string;
  description: string;
  action?: string;
}

// 에러 코드별 사용자 친화적 메시지 매핑
const errorMessages: Record<string, ErrorMessage> = {
  // 네트워크 에러
  NETWORK_ERROR: {
    title: "연결 문제",
    description: "인터넷 연결을 확인해 주세요.",
    action: "다시 시도",
  },
  TIMEOUT: {
    title: "요청 시간 초과",
    description: "서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.",
    action: "다시 시도",
  },

  // 인증 에러
  UNAUTHORIZED: {
    title: "인증 필요",
    description: "로그인이 필요한 서비스입니다.",
    action: "로그인",
  },
  SESSION_EXPIRED: {
    title: "세션 만료",
    description: "로그인 세션이 만료되었습니다. 다시 로그인해 주세요.",
    action: "다시 로그인",
  },

  // 폼 유효성 에러
  VALIDATION_ERROR: {
    title: "입력 오류",
    description: "입력하신 정보를 다시 확인해 주세요.",
  },
  REQUIRED_FIELD: {
    title: "필수 항목",
    description: "필수 항목을 입력해 주세요.",
  },
  INVALID_EMAIL: {
    title: "이메일 형식 오류",
    description: "올바른 이메일 주소를 입력해 주세요.",
  },
  INVALID_PHONE: {
    title: "전화번호 형식 오류",
    description: "올바른 전화번호를 입력해 주세요.",
  },

  // 서버 에러
  SERVER_ERROR: {
    title: "서버 오류",
    description: "일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    action: "다시 시도",
  },
  NOT_FOUND: {
    title: "페이지를 찾을 수 없습니다",
    description: "요청하신 페이지가 존재하지 않거나 이동되었습니다.",
    action: "홈으로 이동",
  },

  // 데이터 에러
  DATA_LOAD_ERROR: {
    title: "데이터 로드 실패",
    description: "데이터를 불러오는 중 문제가 발생했습니다.",
    action: "새로고침",
  },
  SUBMIT_ERROR: {
    title: "제출 실패",
    description: "요청을 처리하는 중 문제가 발생했습니다. 다시 시도해 주세요.",
    action: "다시 시도",
  },

  // 기본 에러
  UNKNOWN: {
    title: "오류 발생",
    description: "예상치 못한 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.",
    action: "다시 시도",
  },
};

/**
 * 에러 코드로 사용자 친화적 메시지 가져오기
 */
export function getErrorMessage(code: string): ErrorMessage {
  return errorMessages[code] || errorMessages.UNKNOWN;
}

/**
 * HTTP 상태 코드로 에러 메시지 가져오기
 */
export function getErrorByStatus(status: number): ErrorMessage {
  switch (status) {
    case 400:
      return errorMessages.VALIDATION_ERROR;
    case 401:
      return errorMessages.UNAUTHORIZED;
    case 403:
      return errorMessages.UNAUTHORIZED;
    case 404:
      return errorMessages.NOT_FOUND;
    case 408:
      return errorMessages.TIMEOUT;
    case 500:
    case 502:
    case 503:
      return errorMessages.SERVER_ERROR;
    default:
      return errorMessages.UNKNOWN;
  }
}

/**
 * Error 객체에서 사용자 친화적 메시지 추출
 */
export function parseError(error: unknown): ErrorMessage {
  if (error instanceof Error) {
    // 네트워크 에러 감지
    if (error.message.includes("fetch") || error.message.includes("network")) {
      return errorMessages.NETWORK_ERROR;
    }
    // 타임아웃 에러 감지
    if (error.message.includes("timeout")) {
      return errorMessages.TIMEOUT;
    }
  }

  return errorMessages.UNKNOWN;
}
