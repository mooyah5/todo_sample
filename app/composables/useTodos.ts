import { storeToRefs } from 'pinia'
import { useTodoStore } from '~/stores/todo'

// =============================================================================
// useTodos — store 를 view-friendly 하게 감싼 composable
// 컴포넌트는 store 를 직접 다루지 않고 이 훅을 통해서만 접근
// =============================================================================

export function useTodos() {
  const store = useTodoStore()
  const {
    todos,
    visibleTodos,
    categories,
    filter,
    selectedCategory,
    activeCount,
    doneCount,
    isLoading,
    isMutating,
    error,
  } = storeToRefs(store)

  return {
    // state (readonly refs)
    todos,
    visibleTodos,
    categories,
    filter,
    selectedCategory,
    activeCount,
    doneCount,
    isLoading,
    isMutating,
    error,
    // actions
    fetchAll: store.fetchAll,
    create: store.create,
    update: store.update,
    toggle: store.toggle,
    remove: store.remove,
    setFilter: store.setFilter,
    setCategory: store.setCategory,
  }
}
