import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    {
      path: '/tool/:id',
      name: 'tool',
      component: () => import('../views/ToolView.vue'),
      props: true,
    },
  ],
})

export default router
