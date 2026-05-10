// =============================================================================
// useDeviceLayout — @nuxtjs/device 를 한 겹 감싸 도메인 의도(레이아웃)에 맞게 노출
// 헤드리스 컴포넌트나 분기 로직에서 이 훅만 사용하도록 통일
// =============================================================================

export function useDeviceLayout() {
  const device = useDevice()

  return {
    isMobile: device.isMobile,
    isTablet: device.isTablet,
    isDesktop: device.isDesktop,
    // 손가락 입력 환경 — 호버 인터랙션 비활성 등에 사용
    isTouch: device.isMobileOrTablet,
  }
}
