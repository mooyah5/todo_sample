<script setup lang="ts">
import { useTodos } from '~/composables/useTodos'

const { t } = useI18n()
const { suspense } = useTodos()

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
    max-width: 640px;
    margin: 0 auto;
    padding: $space-3 $space-4;

    @include from-tablet {
      padding: $space-5 $space-6;
    }
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: $space-6;
  }
}
</style>
