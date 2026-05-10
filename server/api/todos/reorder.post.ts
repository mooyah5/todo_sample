import { createError } from 'h3'
import type { Todo } from '#shared/types/todo'
import { todoStore } from '~~/server/utils/todoStore'

interface ReorderBody {
  ids: string[]
}

function isReorderBody(v: unknown): v is ReorderBody {
  return (
    typeof v === 'object'
    && v !== null
    && Array.isArray((v as ReorderBody).ids)
    && (v as ReorderBody).ids.every((id) => typeof id === 'string')
  )
}

export default defineEventHandler<Promise<Todo[]>>(async (event) => {
  const body = await readBody(event)
  if (!isReorderBody(body)) {
    throw createError({ statusCode: 400, statusMessage: 'ids must be string[]' })
  }
  return todoStore.reorder(body.ids)
})
