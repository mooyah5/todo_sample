import { defineStore } from 'pinia'
import type {
  CreateTodoInput,
  Todo,
  TodoFilter,
  UpdateTodoInput,
} from '#shared/types/todo'

// =============================================================================
// Pinia store — todo 상태 + API 호출 책임
// composables/useTodos 가 이 store 를 감싸서 view-friendly 한 인터페이스 제공
// =============================================================================

interface TodoState {
  todos: Todo[]
  filter: TodoFilter
  selectedCategory: string | null  // null = 전체
  isLoading: boolean
  isMutating: boolean
  error: string | null
}

export const useTodoStore = defineStore('todo', {
  state: (): TodoState => ({
    todos: [],
    filter: 'all',
    selectedCategory: null,
    isLoading: false,
    isMutating: false,
    error: null,
  }),

  getters: {
    categories(state): string[] {
      const set = new Set<string>()
      for (const t of state.todos) {
        if (t.category) set.add(t.category)
      }
      return Array.from(set).sort((a, b) => a.localeCompare(b, 'ko'))
    },

    visibleTodos(state): Todo[] {
      const priorityRank = { high: 0, medium: 1, low: 2 } as const
      return state.todos
        .filter((t) => {
          if (state.filter === 'active' && t.status !== 'todo') return false
          if (state.filter === 'done' && t.status !== 'done') return false
          if (state.selectedCategory && t.category !== state.selectedCategory) return false
          return true
        })
        .slice()
        .sort((a, b) => {
          // 1) 미완료가 먼저
          if (a.status !== b.status) return a.status === 'todo' ? -1 : 1
          // 2) 우선순위 높은 게 먼저
          if (a.priority !== b.priority) {
            return priorityRank[a.priority] - priorityRank[b.priority]
          }
          // 3) 마감일 빠른 게 먼저 (없으면 뒤로)
          if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
          if (a.dueDate) return -1
          if (b.dueDate) return 1
          // 4) 최근 생성순
          return b.createdAt.localeCompare(a.createdAt)
        })
    },

    activeCount(state): number {
      return state.todos.filter((t) => t.status === 'todo').length
    },

    doneCount(state): number {
      return state.todos.filter((t) => t.status === 'done').length
    },
  },

  actions: {
    setFilter(filter: TodoFilter) {
      this.filter = filter
    },

    setCategory(category: string | null) {
      this.selectedCategory = category
    },

    async fetchAll() {
      this.isLoading = true
      this.error = null
      try {
        this.todos = await $fetch<Todo[]>('/api/todos')
      }
      catch (err) {
        this.error = err instanceof Error ? err.message : 'Unknown error'
      }
      finally {
        this.isLoading = false
      }
    },

    async create(input: CreateTodoInput): Promise<Todo | null> {
      this.isMutating = true
      this.error = null
      try {
        const created = await $fetch<Todo>('/api/todos', {
          method: 'POST',
          body: input,
        })
        this.todos = [created, ...this.todos]
        return created
      }
      catch (err) {
        this.error = err instanceof Error ? err.message : 'Create failed'
        return null
      }
      finally {
        this.isMutating = false
      }
    },

    async update(id: string, input: UpdateTodoInput): Promise<Todo | null> {
      this.isMutating = true
      this.error = null
      try {
        const updated = await $fetch<Todo>(`/api/todos/${id}`, {
          method: 'PATCH',
          body: input,
        })
        const idx = this.todos.findIndex((t) => t.id === id)
        if (idx !== -1) this.todos[idx] = updated
        return updated
      }
      catch (err) {
        this.error = err instanceof Error ? err.message : 'Update failed'
        return null
      }
      finally {
        this.isMutating = false
      }
    },

    async toggle(id: string): Promise<Todo | null> {
      const todo = this.todos.find((t) => t.id === id)
      if (!todo) return null
      return this.update(id, { status: todo.status === 'todo' ? 'done' : 'todo' })
    },

    async remove(id: string): Promise<boolean> {
      this.isMutating = true
      this.error = null
      try {
        await $fetch(`/api/todos/${id}`, { method: 'DELETE' })
        this.todos = this.todos.filter((t) => t.id !== id)
        if (this.selectedCategory && !this.todos.some((t) => t.category === this.selectedCategory)) {
          this.selectedCategory = null
        }
        return true
      }
      catch (err) {
        this.error = err instanceof Error ? err.message : 'Delete failed'
        return false
      }
      finally {
        this.isMutating = false
      }
    },
  },
})
