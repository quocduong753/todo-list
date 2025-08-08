<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Status } from '../types/enums'

const props = defineProps<{
  id: string
  title: string
  status: Status
  dueDate?: number
}>()

const emit = defineEmits<{
  (e: 'setStatus', id: string, status: Status): void
  (e: 'remove', id: string): void
  (e: 'edit', id: string, title: string): void
}>()

const editing = ref(false)
const draft = ref(props.title)

function save() {
  const v = draft.value.trim()
  if (v && v !== props.title) emit('edit', props.id, v)
  editing.value = false
}

const isCompleted = computed(() => props.status === 'completed')
const isOverdue = computed(() =>
  props.status !== 'completed' &&
  props.status !== 'cancelled' &&
  props.status !== 'archived' &&
  props.dueDate != null &&
  props.dueDate < Date.now()
)
</script>

<template>
  <li class="flex items-center gap-2 p-2 rounded border border-border">
    <input
      type="checkbox"
      :checked="isCompleted"
      @change="emit('setStatus', props.id, isCompleted ? 'open' : 'completed')"
    />

    <template v-if="!editing">
      <div class="flex-1">
        <span :class="isCompleted && 'line-through opacity-60'">
          {{ props.title }}
        </span>
        <div class="mt-1 flex items-center gap-2 text-xs">
          <span
            v-if="props.dueDate"
            class="badge badge-info"
            :title="new Date(props.dueDate).toLocaleString()"
          >
            Due: {{ new Date(props.dueDate).toLocaleString() }}
          </span>
          <span v-if="isOverdue" class="badge badge-danger">Overdue</span>
        </div>
      </div>

      <button class="btn btn-ghost btn-sm" @click="editing = true; draft = props.title">Edit</button>
      <button class="btn btn-danger btn-sm" @click="emit('remove', props.id)">Del</button>
    </template>

    <template v-else>
      <input
        v-model="draft"
        class="input flex-1"
        @keyup.enter="save"
        @blur="save"
      />
    </template>
  </li>
</template>
