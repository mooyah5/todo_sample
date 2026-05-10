import { createError } from 'h3'
import { todoStore } from '~~/server/utils/todoStore'

export default defineEventHandler<Promise<{ id: string }>>(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id is required' })

  const ok = todoStore.remove(id)
  if (!ok) throw createError({ statusCode: 404, statusMessage: 'Todo not found' })
  return { id }
})
