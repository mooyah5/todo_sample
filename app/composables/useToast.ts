// =============================================================================
// useToast — 가벼운 전역 토스트 큐. 컴포넌트는 push() 만 호출하면 됨.
// SSR 안전성을 위해 useState 로 큐를 공유 (모듈 스코프 ref 는 요청 간 누수 위험).
// =============================================================================

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: string
  kind: ToastKind
  message: string
}

interface PushOptions {
  duration?: number
}

const DEFAULT_DURATION = 3500

let counter = 0

export function useToast() {
  const toasts = useState<Toast[]>('toasts', () => [])

  function dismiss(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  function push(kind: ToastKind, message: string, options: PushOptions = {}): string {
    const id = `toast-${++counter}`
    toasts.value = [...toasts.value, { id, kind, message }]

    if (import.meta.client) {
      const duration = options.duration ?? DEFAULT_DURATION
      window.setTimeout(() => dismiss(id), duration)
    }
    return id
  }

  return {
    toasts: readonly(toasts),
    push,
    success: (message: string, options?: PushOptions) => push('success', message, options),
    error: (message: string, options?: PushOptions) => push('error', message, options),
    info: (message: string, options?: PushOptions) => push('info', message, options),
    dismiss,
  }
}
