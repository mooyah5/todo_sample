import type { Todo } from '#shared/types/todo'
import { todoStore } from '~~/server/utils/todoStore'
import { parseCreateTodoInput } from '~~/server/utils/validate'

export default defineEventHandler<Promise<Todo>>(async (event) => {
  const body = await readBody(event)
  const input = parseCreateTodoInput(body)
  setResponseStatus(event, 201)
  return todoStore.create(input)
})
