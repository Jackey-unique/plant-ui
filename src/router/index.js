import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('@/views/layout/index.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue')
      },
      {
        path: 'greenhouse',
        name: 'Greenhouse',
        component: () => import('@/views/greenhouse/index.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('@/views/profile/index.vue')
      },
      {
        path: 'ai',
        name: 'AI',
        component: () => import('@/views/ai/index.vue')
      },
      {
        path: 'automation',
        name: 'Automation',
        component: () => import('@/views/automation/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 无登录模式：不做任何鉴权拦截
router.beforeEach((to, from, next) => {
  next()
})

export default router