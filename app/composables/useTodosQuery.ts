import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { CreateTodoInput, Todo, UpdateTodoInput } from '#shared/types/todo'

// =============================================================================
// TanStack Query: 서버 상태(todo 목록) 의 fetch / 캐시 / mutation 책임.
// 모든 mutation 은 optimistic update + onError 롤백 패턴.
// 컴포넌트는 직접 import 하지 않고 useTodos 가 감싸 노출.
// =============================================================================

export const TODOS_QUERY_KEY = ['todos'] as const

const nowIso = (): string => new Date().toISOString()

const tempId = (): string =>
  `__temp__${Date.now()}-${Math.random().toString(36).slice(2, 11)}`

// 서버의 store update 와 동일한 patch 적용 — optimistic UI 가 서버와 일치하도록
function applyPatch(prev: Todo, input: UpdateTodoInput): Todo {
  return {
    ...prev,
    ...(input.title !== undefined ? { title: input.title.trim() } : {}),
    ...(input.description !== undefined ? { description: input.description.trim() } : {}),
    ...(input.status !== undefined ? { status: input.status } : {}),
    ...(input.priority !== undefined ? { priority: input.priority } : {}),
    ...(input.category !== undefined ? { category: input.category.trim() } : {}),
    ...(input.tags !== undefined ? { tags: input.tags } : {}),
    ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
    updatedAt: nowIso(),
  }
}

// --- Query --------------------------------------------------------------
export function useTodosQuery() {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: () => $fetch<Todo[]>('/api/todos'),
  })
}

// --- Create -------------------------------------------------------------
interface CreateContext {
  previous: Todo[] | undefined
  tempId: string
}

export function useCreateTodoMutation() {
  const qc = useQueryClient()

  return useMutation<Todo, Error, CreateTodoInput, CreateContext>({
    mutationFn: (input) =>
      $fetch<Todo>('/api/todos', { method: 'POST', body: input }),

    onMutate: async (input) => {
      await qc.cancelQueries({ queryKey: TODOS_QUERY_KEY })
      const previous = qc.getQueryData<Todo[]>(TODOS_QUERY_KEY)
      const id = tempId()
      const t = nowIso()
      const minOrder = previous?.length
        ? Math.min(...previous.map((todo) => todo.order))
        : 0
      const optimistic: Todo = {
        id,
        title: input.title.trim(),
        description: input.description?.trim() ?? '',
        status: 'todo',
        priority: input.priority ?? 'medium',
        category: input.category?.trim() ?? '',
        tags: input.tags ?? [],
        dueDate: input.dueDate ?? null,
        order: minOrder - ORDER_STEP,  // 새 항목은 맨 위에 — 서버 동작과 일치
        createdAt: t,
        updatedAt: t,
      }
      qc.setQueryData<Todo[]>(TODOS_QUERY_KEY, (prev) =>
        prev ? [optimistic, ...prev] : [optimistic],
      )
      return { previous, tempId: id }
    },

    onError: (_err, _input, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(TODOS_QUERY_KEY, context.previous)
      }
    },

    onSuccess: (created, _input, context) => {
      // optimistic 임시 항목을 서버가 돌려준 진짜 항목으로 교체
      qc.setQueryData<Todo[]>(TODOS_QUERY_KEY, (prev) =>
        prev
          ? prev.map((t) => (t.id === context.tempId ? created : t))
          : [created],
      )
    },
  })
}

// --- Update -------------------------------------------------------------
interface UpdateVars {
  id: string
  input: UpdateTodoInput
}
interface UpdateContext {
  previous: Todo[] | undefined
}

export function useUpdateTodoMutation() {
  const qc = useQueryClient()

  return useMutation<Todo, Error, UpdateVars, UpdateContext>({
    mutationFn: ({ id, input }) =>
      $fetch<Todo>(`/api/todos/${id}`, { method: 'PATCH', body: input }),

    onMutate: async ({ id, input }) => {
      await qc.cancelQueries({ queryKey: TODOS_QUERY_KEY })
      const previous = qc.getQueryData<Todo[]>(TODOS_QUERY_KEY)
      qc.setQueryData<Todo[]>(TODOS_QUERY_KEY, (prev) =>
        prev
          ? prev.map((t) => (t.id === id ? applyPatch(t, input) : t))
          : prev,
      )
      return { previous }
    },

    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(TODOS_QUERY_KEY, context.previous)
      }
    },

    onSuccess: (updated) => {
      // 서버 응답으로 cache 동기화 (서버가 정규화한 값이 우선)
      qc.setQueryData<Todo[]>(TODOS_QUERY_KEY, (prev) =>
        prev
          ? prev.map((t) => (t.id === updated.id ? updated : t))
          : [updated],
      )
    },
  })
}

// --- Reorder ------------------------------------------------------------
interface ReorderContext {
  previous: Todo[] | undefined
}

const ORDER_STEP = 100

export function useReorderTodosMutation() {
  const qc = useQueryClient()

  return useMutation<Todo[], Error, string[], ReorderContext>({
    mutationFn: (ids) =>
      $fetch<Todo[]>('/api/todos/reorder', { method: 'POST', body: { ids } }),

    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: TODOS_QUERY_KEY })
      const previous = qc.getQueryData<Todo[]>(TODOS_QUERY_KEY)
      qc.setQueryData<Todo[]>(TODOS_QUERY_KEY, (prev) => {
        if (!prev) return prev
        return prev.map((todo) => {
          const idx = ids.indexOf(todo.id)
          if (idx === -1) return todo
          return { ...todo, order: idx * ORDER_STEP }
        })
      })
      return { previous }
    },

    onError: (_err, _ids, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(TODOS_QUERY_KEY, context.previous)
      }
    },

    onSuccess: (todos) => {
      qc.setQueryData(TODOS_QUERY_KEY, todos)
    },
  })
}

// --- Delete -------------------------------------------------------------
interface DeleteContext {
  previous: Todo[] | undefined
}

export function useDeleteTodoMutation() {
  const qc = useQueryClient()

  return useMutation<{ id: string }, Error, string, DeleteContext>({
    mutationFn: (id) =>
      $fetch<{ id: string }>(`/api/todos/${id}`, { method: 'DELETE' }),

    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: TODOS_QUERY_KEY })
      const previous = qc.getQueryData<Todo[]>(TODOS_QUERY_KEY)
      qc.setQueryData<Todo[]>(TODOS_QUERY_KEY, (prev) =>
        prev ? prev.filter((t) => t.id !== id) : [],
      )
      return { previous }
    },

    onError: (_err, _id, context) => {
      if (context?.previous !== undefined) {
        qc.setQueryData(TODOS_QUERY_KEY, context.previous)
      }
    },
  })
}
