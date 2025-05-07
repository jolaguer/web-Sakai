import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import RegisterView from '@/views/auth/RegisterView.vue'
import DashboardView from '@/views/DashboardView.vue'
import CurrentBooking from '@/components/CurrentBooking.vue'
import VehicleBooking from '@/components/VehicleBooking.vue'
import DriverList from '@/components/DriverList.vue'
import TripHistory from '@/components/TripHistory.vue'
import UserProfile from '@/components/UserProfile.vue'
import { supabase } from '@/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/current-booking',
      name: 'current-booking',
      component: CurrentBooking,
      meta: { requiresAuth: true }
    },
    {
      path: '/book',
      name: 'book',
      component: VehicleBooking,
      meta: { requiresAuth: true }
    },
    {
      path: '/drivers',
      name: 'drivers',
      component: DriverList,
      meta: { requiresAuth: true }
    },
    {
      path: '/trip-history',
      name: 'trip-history',
      component: TripHistory,
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: UserProfile,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  if (requiresAuth && !session) {
    next('/')
  } else if (session && (to.path === '/' || to.path === '/register')) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router