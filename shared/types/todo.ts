// =============================================================================
// Todo 도메인 타입 — client / server 양쪽에서 import.
// Nuxt 4 shared/ 디렉토리는 자동 임포트 + 양쪽 컨텍스트에서 사용 가능.
// =============================================================================

export const PRIORITIES = ['low', 'medium', 'high'] as const
export type Priority = (typeof PRIORITIES)[number]

export const TODO_STATUSES = ['todo', 'done'] as const
export type TodoStatus = (typeof TODO_STATUSES)[number]

export const TODO_FILTERS = ['all', 'active', 'done'] as const
export type TodoFilter = (typeof TODO_FILTERS)[number]

export interface Todo {
  id: string
  title: string
  description: string
  status: TodoStatus
  priority: Priority
  category: string
  tags: string[]
  dueDate: string | null   // ISO date (yyyy-mm-dd) or null
  order: number            // 사용자 정의 정렬 순서 (작은 값이 위)
  createdAt: string        // ISO datetime
  updatedAt: string        // ISO datetime
}

export interface CreateTodoInput {
  title: string
  description?: string
  priority?: Priority
  category?: string
  tags?: string[]
  dueDate?: string | null
}

export interface UpdateTodoInput {
  title?: string
  description?: string
  status?: TodoStatus
  priority?: Priority
  category?: string
  tags?: string[]
  dueDate?: string | null
}

// --- Type guards ---------------------------------------------------------
export function isPriority(v: unknown): v is Priority {
  return typeof v === 'string' && (PRIORITIES as readonly string[]).includes(v)
}

export function isTodoStatus(v: unknown): v is TodoStatus {
  return typeof v === 'string' && (TODO_STATUSES as readonly string[]).includes(v)
}

export function isTodoFilter(v: unknown): v is TodoFilter {
  return typeof v === 'string' && (TODO_FILTERS as readonly string[]).includes(v)
}
