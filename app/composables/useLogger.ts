import pino, { type Logger } from 'pino'

// =============================================================================
// useLogger — pino 기반 로거. 서버/클라이언트 양쪽 동작.
// 모듈 스코프에서 한 번만 인스턴스화한 후 scope 별 child 로 분기.
// =============================================================================

const root: Logger = pino({
  level: import.meta.dev ? 'debug' : 'info',
  browser: {
    asObject: false,
  },
})

export function useLogger(scope?: string): Logger {
  return scope ? root.child({ scope }) : root
}
