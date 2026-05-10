import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { CreateTodoInput, Todo, UpdateTodoInput } from '#shared/types/todo'

// =============================================================================
// TanStack Query: 서버 상태(todo 목록) 의 fetch / 캐시 / mutation 책임.
// 컴포넌트는 이 훅들을 직접 쓰지 않고 useTodos 가 감싸서 노출.
// =============================================================================

export const TODOS_QUERY_KEY = ['todos'] as const

export function useTodosQuery() {
  return useQuery({
    queryKey: TODOS_QUERY_KEY,
    queryFn: () => $fetch<Todo[]>('/api/todos'),
  })
}

export function useCreateTodoMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTodoInput) =>
      $fetch<Todo>('/api/todos', { method: 'POST', body: input }),
    onSuccess: (created) => {
      qc.setQueryData<Todo[]>(TODOS_QUERY_KEY, (prev) =>
        prev ? [created, ...prev] : [created],
      )
    },
  })
}

export function useUpdateTodoMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTodoInput }) =>
      $fetch<Todo>(`/api/todos/${id}`, { method: 'PATCH', body: input }),
    onSuccess: (updated) => {
      qc.setQueryData<Todo[]>(TODOS_QUERY_KEY, (prev) =>
        prev ? prev.map((t) => (t.id === updated.id ? updated : t)) : [updated],
      )
    },
  })
}

export function useDeleteTodoMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      $fetch<{ id: string }>(`/api/todos/${id}`, { method: 'DELETE' }),
    onSuccess: ({ id }) => {
      qc.setQueryData<Todo[]>(TODOS_QUERY_KEY, (prev) =>
        prev ? prev.filter((t) => t.id !== id) : [],
      )
    },
  })
}
