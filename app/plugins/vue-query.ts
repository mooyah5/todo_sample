import {
  type DehydratedState,
  hydrate,
  QueryClient,
  VueQueryPlugin,
  dehydrate,
} from '@tanstack/vue-query'

// =============================================================================
// Vue Query Nuxt 플러그인 — SSR 시 dehydrate, 클라이언트 hydrate.
// useState 로 직렬화 가능한 상태를 페이로드에 실어 일관된 hydration 보장.
// =============================================================================

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query', () => null)

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  })

  nuxt.vueApp.use(VueQueryPlugin, { queryClient })

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }
  if (import.meta.client) {
    nuxt.hooks.hook('app:created', () => {
      if (vueQueryState.value) hydrate(queryClient, vueQueryState.value)
    })
  }
})
