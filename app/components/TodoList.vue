<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { Todo } from '#shared/types/todo'
import { useTodos } from '~/composables/useTodos'

const { t } = useI18n()
const { visibleTodos, isLoading, filter, error, reorder } = useTodos()

const emptyMessage = computed(() => {
  if (filter.value === 'active') return t('list.empty.active')
  if (filter.value === 'done') return t('list.empty.done')
  return t('list.empty.all')
})

function onReorder(newList: Todo[]) {
  reorder(newList.map((t) => t.id))
}
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

    <VueDraggable
      v-else
      :model-value="visibleTodos"
      tag="ul"
      class="list__items"
      handle=".item__drag"
      :animation="200"
      ghost-class="item--ghost"
      chosen-class="item--chosen"
      drag-class="item--dragging"
      @update:model-value="onReorder"
    >
      <TodoItem
        v-for="todo in visibleTodos"
        :key="todo.id"
        :todo="todo"
      />
    </VueDraggable>
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

// Sortable.js 가 추가하는 클래스 — TodoItem 의 :is-deep 으로 적용해야 하지만
// 여기선 list 가 부모니 ::v-deep 로 자식 li 에 닿게.
:deep(.item--ghost) {
  opacity: 0.35;
  background: var(--color-accent-soft);
}
:deep(.item--chosen) {
  background: var(--color-surface-alt);
}
:deep(.item--dragging) {
  opacity: 0.95;
}
</style>
