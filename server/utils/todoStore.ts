import { randomUUID } from 'node:crypto'
import type { CreateTodoInput, Priority, Todo, UpdateTodoInput } from '#shared/types/todo'

// =============================================================================
// 서버 사이드 인메모리 mock store
// 실제 서비스라면 DB에 들어갈 자리. 모듈 싱글톤으로 동작.
// 서버 재시작 시 시드 데이터로 초기화됨.
// =============================================================================

const nowIso = (): string => new Date().toISOString()

function seed(): Todo[] {
  const t = nowIso()
  return [
    {
      id: randomUUID(),
      title: '동아리 과제 todo 앱 마무리',
      description: '아키텍처와 디자인 폴리시에 집중',
      status: 'todo',
      priority: 'high',
      category: '동아리',
      tags: ['nuxt4', 'frontend'],
      dueDate: null,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: randomUUID(),
      title: 'SCSS 토큰 정리',
      description: '',
      status: 'done',
      priority: 'medium',
      category: '동아리',
      tags: ['design'],
      dueDate: null,
      createdAt: t,
      updatedAt: t,
    },
    {
      id: randomUUID(),
      title: '커피 사오기',
      description: '',
      status: 'todo',
      priority: 'low',
      category: '일상',
      tags: [],
      dueDate: null,
      createdAt: t,
      updatedAt: t,
    },
  ]
}

let todos: Todo[] = seed()

function clamp<T>(value: T | undefined, fallback: T): T {
  return value === undefined ? fallback : value
}

function normalizeTags(tags: string[] | undefined): string[] {
  if (!tags) return []
  return Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)))
}

export const todoStore = {
  list(): Todo[] {
    return [...todos]
  },

  get(id: string): Todo | undefined {
    return todos.find((t) => t.id === id)
  },

  create(input: CreateTodoInput): Todo {
    const t = nowIso()
    const todo: Todo = {
      id: randomUUID(),
      title: input.title.trim(),
      description: clamp(input.description, '').trim(),
      status: 'todo',
      priority: clamp<Priority>(input.priority, 'medium'),
      category: clamp(input.category, '').trim(),
      tags: normalizeTags(input.tags),
      dueDate: input.dueDate ?? null,
      createdAt: t,
      updatedAt: t,
    }
    todos = [todo, ...todos]
    return todo
  },

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const idx = todos.findIndex((t) => t.id === id)
    if (idx === -1) return undefined
    const prev = todos[idx]!
    const next: Todo = {
      ...prev,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description.trim() } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.priority !== undefined ? { priority: input.priority } : {}),
      ...(input.category !== undefined ? { category: input.category.trim() } : {}),
      ...(input.tags !== undefined ? { tags: normalizeTags(input.tags) } : {}),
      ...(input.dueDate !== undefined ? { dueDate: input.dueDate } : {}),
      updatedAt: nowIso(),
    }
    todos[idx] = next
    return next
  },

  remove(id: string): boolean {
    const before = todos.length
    todos = todos.filter((t) => t.id !== id)
    return todos.length < before
  },
}
