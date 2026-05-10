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
    padding: $space-3 $space-4;
    background: color-mix(in srgb, var(--color-danger) 12%, transparent);
    color: var(--color-danger);
    border-radius: $radius-md;
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
    display: flex;
    flex-direction: column;
    gap: $space-3;
  }
}

.todo-move,
.todo-enter-active,
.todo-leave-active {
  transition:
    transform $duration-base $ease-out,
    opacity $duration-base $ease-out;
}
.todo-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.todo-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
.todo-leave-active {
  position: absolute;
  width: 100%;
}
</style>
