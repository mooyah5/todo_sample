<script setup lang="ts">
import { useTodoStore } from '~/stores/todo'

const { t } = useI18n()
const store = useTodoStore()

// SSR 시점에 미리 로드 (HMR 시에도 한 번 더 호출되지만 멱등)
await useAsyncData('todos:initial', async () => {
  await store.fetchAll()
  return true
})

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
