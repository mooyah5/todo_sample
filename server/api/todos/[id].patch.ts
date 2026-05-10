import { createError } from 'h3'
import type { Todo } from '#shared/types/todo'
import { todoStore } from '~~/server/utils/todoStore'
import { parseUpdateTodoInput } from '~~/server/utils/validate'

export default defineEventHandler<Promise<Todo>>(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const body = await readBody(event)
  const input = parseUpdateTodoInput(body)
  const updated = todoStore.update(id, input)
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Todo not found' })
  return updated
})
