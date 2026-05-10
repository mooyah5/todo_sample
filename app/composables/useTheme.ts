// =============================================================================
// useTheme — 다크/라이트 테마. 쿠키로 SSR 시점에도 일관된 값 유지.
// <html data-theme="..."> 로 적용 (FOUC 방지를 위해 app.vue 의 useHead 에서 설정)
// =============================================================================

export type Theme = 'light' | 'dark'

const THEMES: readonly Theme[] = ['light', 'dark'] as const

function isTheme(v: unknown): v is Theme {
  return typeof v === 'string' && (THEMES as readonly string[]).includes(v)
}

export function useTheme() {
  const cookie = useCookie<Theme>('theme', {
    default: () => 'light',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  })

  const theme = computed<Theme>(() => (isTheme(cookie.value) ? cookie.value : 'light'))

  function setTheme(next: Theme) {
    cookie.value = next
  }

  function toggle() {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  // 클라이언트에서 변경 시 즉시 <html> 에 반영 (SSR 마크업과 동기화)
  if (import.meta.client) {
    watch(theme, (v) => {
      document.documentElement.dataset.theme = v
    })
  }

  return { theme, setTheme, toggle }
}
