import { TodoSchema, TodoCreateSchema, TodoUpdateSchema,
         type Todo, type TodoCreate, type TodoUpdate } from './todo'

export function createTodo(input: string | TodoCreate): Todo {
  const base = typeof input === 'string'
    ? TodoCreateSchema.parse({ title: input })
    : TodoCreateSchema.parse(input)

  return TodoSchema.parse({
    id: crypto.randomUUID(),
    title: base.title,
    status: 'open',
    description: base.description,
    dueDate: base.dueDate,
    priority: base.priority ?? 'medium',
    tags: base.tags ?? [],
  })
}

export function applyUpdate(current: Todo, patch: TodoUpdate): Todo {
  const upd = TodoUpdateSchema.parse(patch)

  const nextDue = upd.dueDate === null ? undefined : upd.dueDate ?? current.dueDate
  let nextCompleted = upd.completedAt === null ? undefined : upd.completedAt ?? current.completedAt

  const nextStatus = upd.status ?? current.status
  if (nextStatus === 'completed' && !nextCompleted) nextCompleted = Date.now()

  return TodoSchema.parse({
    ...current,
    ...upd,
    status: nextStatus,
    dueDate: nextDue,
    completedAt: nextCompleted,
  })
}

export function toTimestamp(dateISO?: string, timeHHmm?: string): number | undefined {
  if (!dateISO) return undefined
  const [y, m, d] = dateISO.split('-').map(Number)
  const [hh, mm] = (timeHHmm || '00:00').split(':').map(Number)
  return new Date(y, m - 1, d, hh || 0, mm || 0).getTime()
}
