import { createError } from 'h3'
import {
  isPriority,
  isTodoStatus,
  type CreateTodoInput,
  type UpdateTodoInput,
} from '#shared/types/todo'

// =============================================================================
// 가벼운 핸드롤드 input validator (zod 안 끌어옴 — 의존성 최소화)
// 잘못된 입력은 createError(400) 으로 던짐 — 핸들러에서 그대로 전파
// =============================================================================

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === 'string')
}

function badRequest(message: string): never {
  throw createError({ statusCode: 400, statusMessage: message })
}

export function parseCreateTodoInput(body: unknown): CreateTodoInput {
  if (!isObject(body)) badRequest('Invalid request body')

  const { title, description, priority, category, tags, dueDate } = body

  if (typeof title !== 'string' || title.trim().length === 0) {
    badRequest('title is required')
  }
  if (description !== undefined && typeof description !== 'string') {
    badRequest('description must be a string')
  }
  if (priority !== undefined && !isPriority(priority)) {
    badRequest('priority must be one of: low | medium | high')
  }
  if (category !== undefined && typeof category !== 'string') {
    badRequest('category must be a string')
  }
  if (tags !== undefined && !isStringArray(tags)) {
    badRequest('tags must be an array of strings')
  }
  if (dueDate !== undefined && dueDate !== null && typeof dueDate !== 'string') {
    badRequest('dueDate must be a string or null')
  }

  return {
    title: title as string,
    description: description as string | undefined,
    priority: priority as CreateTodoInput['priority'],
    category: category as string | undefined,
    tags: tags as string[] | undefined,
    dueDate: dueDate as string | null | undefined,
  }
}

export function parseUpdateTodoInput(body: unknown): UpdateTodoInput {
  if (!isObject(body)) badRequest('Invalid request body')

  const { title, description, status, priority, category, tags, dueDate } = body

  if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
    badRequest('title must be a non-empty string')
  }
  if (description !== undefined && typeof description !== 'string') {
    badRequest('description must be a string')
  }
  if (status !== undefined && !isTodoStatus(status)) {
    badRequest('status must be one of: todo | done')
  }
  if (priority !== undefined && !isPriority(priority)) {
    badRequest('priority must be one of: low | medium | high')
  }
  if (category !== undefined && typeof category !== 'string') {
    badRequest('category must be a string')
  }
  if (tags !== undefined && !isStringArray(tags)) {
    badRequest('tags must be an array of strings')
  }
  if (dueDate !== undefined && dueDate !== null && typeof dueDate !== 'string') {
    badRequest('dueDate must be a string or null')
  }

  return {
    title: title as string | undefined,
    description: description as string | undefined,
    status: status as UpdateTodoInput['status'],
    priority: priority as UpdateTodoInput['priority'],
    category: category as string | undefined,
    tags: tags as string[] | undefined,
    dueDate: dueDate as string | null | undefined,
  }
}
