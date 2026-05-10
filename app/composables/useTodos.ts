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
  useTodosQuery,
  useUpdateTodoMutation,
} from '~/composables/useTodosQuery'

// =============================================================================
// useTodos — 서버 상태(TanStack) + UI 상태(Pinia) 를 한 인터페이스로 결합.
// 컴포넌트는 이 훅만 쓰면 됨; 데이터 출처를 신경쓰지 않도록 캡슐화.
// =============================================================================

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const

export function useTodos() {
  const query = useTodosQuery()
  const createMutation = useCreateTodoMutation()
  const updateMutation = useUpdateTodoMutation()
  const deleteMutation = useDeleteTodoMutation()

  const ui = useTodoUiStore()
  const { filter, selectedCategory } = storeToRefs(ui)

  const todos = computed<Todo[]>(() => query.data.value ?? [])
  const isLoading = computed<boolean>(() => query.isPending.value)
  const isMutating = computed<boolean>(
    () =>
      createMutation.isPending.value
      || updateMutation.isPending.value
      || deleteMutation.isPending.value,
  )
  const error = computed<string | null>(() => {
    const e
      = query.error.value
        ?? createMutation.error.value
        ?? updateMutation.error.value
        ?? deleteMutation.error.value
    return e instanceof Error ? e.message : null
  })

  const categories = computed<string[]>(() => {
    const set = new Set<string>()
    for (const t of todos.value) {
      if (t.category) set.add(t.category)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'))
  })

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
        if (a.status !== b.status) return a.status === 'todo' ? -1 : 1
        if (a.priority !== b.priority) return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
        if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return b.createdAt.localeCompare(a.createdAt)
      }),
  )

  const activeCount = computed(() => todos.value.filter((t) => t.status === 'todo').length)
  const doneCount = computed(() => todos.value.filter((t) => t.status === 'done').length)

  // --- mutations (mutateAsync 를 try/catch 로 감싸 null/false 반환 — 호출부 단순화)
  async function create(input: CreateTodoInput): Promise<Todo | null> {
    try {
      return await createMutation.mutateAsync(input)
    }
    catch {
      return null
    }
  }

  async function update(id: string, input: UpdateTodoInput): Promise<Todo | null> {
    try {
      return await updateMutation.mutateAsync({ id, input })
    }
    catch {
      return null
    }
  }

  async function toggle(id: string): Promise<Todo | null> {
    const todo = todos.value.find((t) => t.id === id)
    if (!todo) return null
    return update(id, { status: todo.status === 'todo' ? 'done' : 'todo' })
  }

  async function remove(id: string): Promise<boolean> {
    try {
      await deleteMutation.mutateAsync(id)
      // 카테고리 필터가 비게 되면 풀어줌
      if (
        selectedCategory.value
        && !todos.value.some((t) => t.id !== id && t.category === selectedCategory.value)
      ) {
        ui.setCategory(null)
      }
      return true
    }
    catch {
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
    setFilter: ui.setFilter,
    setCategory: ui.setCategory,
    // SSR 친화: page 에서 await suspense() 로 초기 fetch 대기
    suspense: query.suspense,
  }
}
