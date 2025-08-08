<script setup lang="ts">
import { ref, computed } from 'vue'
import type { TodoCreate } from '../types/todo'
import { toTimestamp } from '../types/todo.helpers'

const emit = defineEmits<{ (e:'submit', payload: TodoCreate): void }>()

const title = ref('')
const description = ref('')
const dateISO = ref('')
const timeHHmm = ref('')
const priority = ref<'low'|'medium'|'high'>('medium')
const tagsText = ref('')

const canSubmit = computed(
  () => title.value.trim().length > 0 && description.value.length <= 500
)

function onSubmit() {
  const t = title.value.trim()
  if (!t) return
  const tags = tagsText.value.split(',').map(s => s.trim()).filter(Boolean)
  emit('submit', {
    title: t,
    description: description.value.trim() || undefined,
    dueDate: toTimestamp(dateISO.value, timeHHmm.value),
    priority: priority.value,
    tags: tags.length ? tags : undefined,
  })
  // reset
  title.value = ''
  description.value = ''
  dateISO.value = ''
  timeHHmm.value = ''
  priority.value = 'medium'
  tagsText.value = ''
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-2">
    <div class="flex gap-2">
      <input v-model.trim="title" class="input flex-1" placeholder="New todo..." />
      <button class="btn btn-primary" type="submit" :disabled="!canSubmit">Add</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-2">
      <input v-model="description" class="input md:col-span-2" placeholder="Description (optional)" />
      <input v-model="dateISO" type="date" class="input" />
      <input v-model="timeHHmm" type="time" class="input" />
      <select v-model="priority" class="input">
        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
      </select>
      <input v-model="tagsText" class="input md:col-span-2" placeholder="Tags (comma separated)" />
    </div>
  </form>
</template>
