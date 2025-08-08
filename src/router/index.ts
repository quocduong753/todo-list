import { createRouter, createWebHistory } from 'vue-router'

const TodosPage = () => import('@/features/todos/pages/TodosPage.vue')
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
      {
        path: '/',
        name: 'todos',
        component: TodosPage
      }
  ],
})

export default router
