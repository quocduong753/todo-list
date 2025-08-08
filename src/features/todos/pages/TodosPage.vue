<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { useTodoStore, type Filter } from '../store/todo.store'
import TodoInput from '../components/TodoInput.vue'
import TodoItem from '../components/TodoItem.vue'
import type { TodoCreate } from '../types/todo'   

const store = useTodoStore()

onMounted(() => store.init())
onBeforeUnmount(() => store.stopClock())

// Tabs: all + từng trạng thái + overdue
const tabs: { key: Filter; label: string}[] = [
  { key: 'all', label: 'All' },
  { key: 'open', label: 'Open' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
  { key: 'archived', label: 'Archived' },
  { key: 'overdue', label: 'Overdue' },
]

const statsText = computed(() => {
  const s = store.stats
  return `All: ${s.all} • Open: ${s.perStatus.open} • In progress: ${s.perStatus.in_progress} • Completed: ${s.perStatus.completed} • Overdue: ${s.overdue}`
})

function onSubmit(payload: TodoCreate) {
  store.add(payload)
}
</script>

<template>
  <section class="container-page py-6 space-y-4">
    <header class="flex items-center justify-between">
      <h1 class="text-3xl font-bold">Todos</h1>
      <div class="text-sm muted">{{ statsText }}</div>
    </header>

    <div class="card">
      <div class="card-body space-y-3">
        <TodoInput @submit="onSubmit" />

        <div class="flex items-center gap-2">
          <div class="inline-flex rounded border border-border p-1">
            <button
              v-for="t in tabs"
              :key="t.key"
              class="px-3 py-1 rounded cursor-pointer"
              :class="store.filter === t.key ? 'bg-foreground/5' : ''"
              @click="store.setFilter(t.key as any)"
            >{{ t.label }}</button>
          </div>

          <input
            class="input ml-auto max-w-xs"
            placeholder="Search..."
            :value="store.query"
            @input="store.setQuery(($event.target as HTMLInputElement).value)"
          />
          <button class="btn btn-ghost" @click="store.clearCompleted()">Clear completed</button>
        </div>

        <ul class="space-y-2" v-if="store.filtered.length">
          <TodoItem
            v-for="t in store.filtered"
            :key="t.id"
            :id="t.id"
            :title="t.title"
            :status="t.status"
            :due-date="t.dueDate"
            @setStatus="(id, st) => store.update(id, { status: st })"
            @remove="store.remove"
            @edit="(id, title) => store.editTitle(id, title)"
          />
        </ul>
        <div v-else class="alert alert-info">No todos yet.</div>
      </div>
    </div>
  </section>
</template>
