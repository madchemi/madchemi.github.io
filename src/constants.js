// src/constants.js

/**
 * FastAPI 백엔드 서버의 기본 URL입니다.
 * 로컬 개발 환경에서는 보통 'http://localhost:8000' 또는 'http://127.0.0.1:8000'를 사용합니다.
 * 실제 배포 시에는 배포된 백엔드 서버의 주소로 변경해야 합니다.
 * 이 값은 반드시 실제 환경에 맞게 수정해주세요.
 */
export const API_BASE_URL = 'http://localhost:8000'; // TODO: 실제 백엔드 서버 주소로 반드시 변경해주세요!

/**
 * 애플리케이션에서 공통으로 사용될 색상 팔레트입니다.
 * App.js 등에서 사용된 예시를 기반으로 작성되었으며, 필요에 따라 추가하거나 수정해서 사용하세요.
 * 각 색상의 값은 실제 디자인에 맞게 조정해주세요.
 */
export const COLORS = {
  primary: '#5E72E4',         // 메인 색상 (예: 버튼, 주요 UI 요소)
  secondary: '#8898AA',       // 보조 색상 (예: 덜 중요한 UI 요소, 부가 정보)
  text_primary: '#212529',    // 주요 텍스트 색상 (예: 본문)
  text_secondary: '#8898AA',  // 보조 텍스트 색상 (예: 설명, 캡션)
  bg_white: '#FFFFFF',        // 흰색 배경
  bg_light_gray: '#F4F7F6',   // 밝은 회색 배경 (App.js에서 사용된 예시)
  border_gray: '#E0E0E0',     // 회색 테두리 (App.js에서 사용된 예시)
  success: '#2DCE89',         // 성공 상태 알림 색상
  danger: '#F5365C',          // 위험/에러 상태 알림 색상
  warning: '#FB6340',         // 경고 상태 알림 색상
  info: '#11CDEF',            // 정보 상태 알림 색상

  // 프로젝트의 필요에 따라 아래와 같이 추가적인 색상을 정의할 수 있습니다.
  // brand_main: '#YOUR_BRAND_COLOR', // 브랜드 대표 색상
  // highlight_color: '#YOUR_HIGHLIGHT_COLOR', // 강조 색상
  // disabled_color: '#CED4DA', // 비활성화 상태 색상
};

// 기타 애플리케이션 전역에서 사용될 수 있는 상수들
// 예시:
// export const DEFAULT_PAGE_SIZE = 10; // 페이지네이션 기본 아이템 수
// export const MAX_UPLOAD_FILE_SIZE = 5 * 1024 * 1024; // 최대 업로드 파일 크기 (5MB)
// export const APP_VERSION = '1.0.0'; // 애플리케이션 버전