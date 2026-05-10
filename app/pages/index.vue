<script setup lang="ts">
import { useTodos } from '~/composables/useTodos'

const { t } = useI18n()
const { suspense } = useTodos()

// SSR 시점에 초기 fetch 대기 — TanStack Query 의 hydrate 로 클라이언트에 그대로 이관됨
await suspense()

useHead({ title: () => t('app.title') })
</script>

<template>
  <div class="page">
    <div class="page__inner">
      <AppHeader />
      <main class="page__main">
        <TodoForm />
        <TodoFilter />
        <TodoList />
      </main>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page {
  min-height: 100vh;

  &__inner {
    max-width: 720px;
    margin: 0 auto;
    padding: $space-4;

    @include from-tablet {
      padding: $space-6;
    }
  }

  &__main {
    display: grid;
    gap: $space-5;
  }
}
</style>
