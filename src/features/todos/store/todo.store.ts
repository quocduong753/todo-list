// src/features/todos/store/todo.store.ts
import { defineStore } from 'pinia'
import { isOverdue, TodoSchema, type Todo, type TodoCreate, type TodoUpdate } from '../types/todo'
import { createTodo, applyUpdate } from '../types/todo.helpers'
import { StatusList, type Status, type Priority } from '../types/enums'

export type Filter =
  | 'all' | 'overdue'
  | 'open' | 'in_progress' | 'completed' | 'cancelled' | 'archived'


export const useTodoStore = defineStore('todo', {
  state: () => ({
    todos: [] as Todo[],
    filter: 'all' as Filter,
    query: '' as string,
    now: Date.now(),
    _timer: null as number | null,
  }),

  getters: {
    filtered(s): Todo[] {
    let arr = s.todos.slice()

    if (s.filter === 'open')         arr = arr.filter(t => t.status === 'open')
    if (s.filter === 'in_progress')  arr = arr.filter(t => t.status === 'in_progress')
    if (s.filter === 'completed')    arr = arr.filter(t => t.status === 'completed')
    if (s.filter === 'cancelled')    arr = arr.filter(t => t.status === 'cancelled')
    if (s.filter === 'archived')     arr = arr.filter(t => t.status === 'archived')
    if (s.filter === 'overdue')      arr = arr.filter(t => isOverdue(t, s.now))

    const q = s.query.trim().toLowerCase()
    if (q) {
      arr = arr.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description?.toLowerCase().includes(q) ?? false) ||
        (t.tags?.some(tag => tag.toLowerCase().includes(q)) ?? false)
      )
    }

    arr.sort((a, b) => {
      const ao = isOverdue(a, s.now) ? 1 : 0
      const bo = isOverdue(b, s.now) ? 1 : 0
      if (ao !== bo) return bo - ao
      return (a.dueDate ?? Infinity) - (b.dueDate ?? Infinity)
    })
    return arr
  },

    stats(s) {
      const perStatus = StatusList.reduce((acc, st) => { acc[st] = 0; return acc }, {} as Record<Status, number>)
      for (const todo of s.todos) perStatus[todo.status]++
      const overdue = s.todos.reduce((n, t) => n + (isOverdue(t, s.now) ? 1 : 0), 0)

      return { all: s.todos.length, overdue, perStatus }
    }
  },

  actions: {
    init() {
      this.todos = TodoSchema.array().parse(this.todos as unknown)
      if (this._timer == null)
         this._timer = window.setInterval(() => { this.now = Date.now() }, 60_000)
    },
    stopClock() {
      if (this._timer != null) { clearInterval(this._timer); this._timer = null } 
    },

    add(payload: string | TodoCreate) {
      const todo = createTodo(payload); this.todos.unshift(todo)
    },
    update(id: string, patch: TodoUpdate) {
      const i = this.todos.findIndex(t => t.id === id); if (i === -1) return
      this.todos[i] = applyUpdate(this.todos[i], patch)
    },
    remove(id: string) { this.todos = this.todos.filter(t => t.id !== id) },

    setStatus(id: string, status: Status){ 
      this.update(id, { status }) 
    },
    complete(id: string){
      this.update(id, { status: 'completed' })
    },
    reopen(id: string) {
      this.update(id, { status: 'open', completedAt: null })
    },

    cancel(id: string) {
     this.update(id, { status: 'cancelled' })
    },

    editTitle(id: string, title: string){
      this.update(id, { title: title.trim() })
    },

    setDescription(id: string, desc?: string) {
      this.update(id, { description: (desc?.trim() || undefined) })
    },

    setDueDate(id: string, ts?: number) {
       this.update(id, { dueDate: ts ?? null })
    },

    setPriority(id: string, p: Priority) {
      this.update(id, { priority: p })
    },

    setTags(id: string, tags: string[]) {
      this.update(id, { tags }) 
    },

    setFilter(f: Filter) {
      this.filter = f
    },

    setQuery(q: string) {
      this.query = q.trim()
    },

    clearCompleted() {
      this.todos = this.todos.filter(t => t.status !== 'completed')
    },
  },

  persist: {
    key: 'todo-list:v2',
    storage: localStorage,
    pick: ['todos', 'filter'],
  },
})
