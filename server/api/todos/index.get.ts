import type { Todo } from '#shared/types/todo'
import { todoStore } from '~~/server/utils/todoStore'

export default defineEventHandler<Promise<Todo[]>>(async () => {
  return todoStore.list()
})
