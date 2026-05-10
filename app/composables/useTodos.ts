import { storeToRefs } from 'pinia'
import type {
  CreateTodoInput,
  Todo,
  UpdateTodoInput,
} from '#shared/types/todo'
import { useTodoUiStore } from '~/stores/todoUi'
import {
  useCreateTodoMutation,
  useDeleteTodoMutation,
  useReorderTodosMutation,
  useTodosQuery,
  useUpdateTodoMutation,
} from '~/composables/useTodosQuery'

// =============================================================================
// useTodos — 서버 상태(TanStack) + UI 상태(Pinia) + 토스트 알림 결합.
// 컴포넌트는 이 훅만 쓰면 됨; 데이터 출처/에러 처리를 신경쓰지 않도록 캡슐화.
// =============================================================================

export function useTodos() {
  const { t } = useI18n()
  const toast = useToast()

  const query = useTodosQuery()
  const createMutation = useCreateTodoMutation()
  const updateMutation = useUpdateTodoMutation()
  const deleteMutation = useDeleteTodoMutation()
  const reorderMutation = useReorderTodosMutation()

  const ui = useTodoUiStore()
  const { filter, selectedCategory } = storeToRefs(ui)

  // --- derived state -----------------------------------------------------
  const todos = computed<Todo[]>(() => query.data.value ?? [])
  const isLoading = computed<boolean>(() => query.isPending.value)
  const isMutating = computed<boolean>(
    () =>
      createMutation.isPending.value
      || updateMutation.isPending.value
      || deleteMutation.isPending.value,
  )
  const error = computed<string | null>(() => {
    const e = query.error.value
    return e instanceof Error ? e.message : null
  })

  const categories = computed<string[]>(() => {
    const set = new Set<string>()
    for (const t of todos.value) {
      if (t.category) set.add(t.category)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'))
  })

  // 사용자 정렬 우선 — 드래그로 잡은 order 값에 따름.
  // 동일 order 시 createdAt 으로 안정 정렬.
  const visibleTodos = computed<Todo[]>(() =>
    todos.value
      .filter((t) => {
        if (filter.value === 'active' && t.status !== 'todo') return false
        if (filter.value === 'done' && t.status !== 'done') return false
        if (selectedCategory.value && t.category !== selectedCategory.value) return false
        return true
      })
      .slice()
      .sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order
        return a.createdAt.localeCompare(b.createdAt)
      }),
  )

  const activeCount = computed(() => todos.value.filter((t) => t.status === 'todo').length)
  const doneCount = computed(() => todos.value.filter((t) => t.status === 'done').length)

  // --- mutations: optimistic 가 cache 를 즉시 갱신하므로 호출부는 결과만 받으면 됨
  // 실패 시 롤백은 mutation 내부에서 처리, 여기서는 토스트만.
  async function create(input: CreateTodoInput): Promise<Todo | null> {
    try {
      const created = await createMutation.mutateAsync(input)
      toast.success(t('toast.created'))
      return created
    }
    catch {
      toast.error(t('errors.createFailed'))
      return null
    }
  }

  async function update(id: string, input: UpdateTodoInput): Promise<Todo | null> {
    try {
      return await updateMutation.mutateAsync({ id, input })
    }
    catch {
      toast.error(t('errors.updateFailed'))
      return null
    }
  }

  async function toggle(id: string): Promise<Todo | null> {
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) return null
    return update(id, { status: todo.status === 'todo' ? 'done' : 'todo' })
  }

  async function reorder(ids: string[]): Promise<boolean> {
    try {
      await reorderMutation.mutateAsync(ids)
      return true
    }
    catch {
      toast.error(t('errors.reorderFailed'))
      return false
    }
  }

  async function remove(id: string): Promise<boolean> {
    try {
      await deleteMutation.mutateAsync(id)
      // 카테고리 필터가 비게 되면 해제
      if (
        selectedCategory.value
        && !todos.value.some((t) => t.category === selectedCategory.value)
      ) {
        ui.setCategory(null)
      }
      toast.success(t('toast.deleted'))
      return true
    }
    catch {
      toast.error(t('errors.deleteFailed'))
      return false
    }
  }

  return {
    // state (readonly)
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
    create,
    update,
    toggle,
    remove,
    reorder,
    setFilter: ui.setFilter,
    setCategory: ui.setCategory,
    // SSR 친화: page 에서 await suspense() 로 초기 fetch 대기
    suspense: query.suspense,
  }
}
