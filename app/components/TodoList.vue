<script setup lang="ts">
import { useTodos } from '~/composables/useTodos'

const { t } = useI18n()
const { visibleTodos, isLoading, filter, error } = useTodos()

const emptyMessage = computed(() => {
  if (filter.value === 'active') return t('list.empty.active')
  if (filter.value === 'done') return t('list.empty.done')
  return t('list.empty.all')
})
</script>

<template>
  <section class="list" :aria-busy="isLoading">
    <p v-if="error" class="list__error" role="alert">{{ error }}</p>

    <div v-if="isLoading && visibleTodos.length === 0" class="list__loading">
      {{ t('list.loading') }}
    </div>

    <EmptyState
      v-else-if="!isLoading && visibleTodos.length === 0"
      :message="emptyMessage"
    />

    <TransitionGroup v-else name="todo" tag="ul" class="list__items">
      <TodoItem
        v-for="todo in visibleTodos"
        :key="todo.id"
        :todo="todo"
      />
    </TransitionGroup>
  </section>
</template>

<style lang="scss" scoped>
.list {
  &__error {
    margin: 0 0 $space-3;
    padding: $space-2 $space-3;
    color: var(--color-danger);
    font-size: $font-size-sm;
  }

  &__loading {
    padding: $space-7 0;
    text-align: center;
    color: var(--color-text-subtle);
    font-size: $font-size-sm;
  }

  &__items {
    list-style: none;
    margin: 0;
    padding: 0;
    border-top: 1px solid var(--color-border);
  }
}

.todo-move,
.todo-enter-active,
.todo-leave-active {
  transition:
    transform $duration-base $ease-out,
    opacity $duration-base $ease-out;
}
.todo-enter-from { opacity: 0; transform: translateY(-6px); }
.todo-leave-to   { opacity: 0; transform: translateX(12px); }
// 의도적으로 position: absolute 안 씀 — leave 동안 항목이 flow 에 남아있어야
// 페이지 높이가 트랜지션 중에 잠깐 늘어나면서 스크롤바가 깜빡이지 않음.
// 트레이드오프: 다른 항목들의 reflow 가 leave 끝난 후 한 번에 일어남.
</style>
