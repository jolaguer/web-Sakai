<template>
  <aside class="w-64 bg-white h-screen py-4 px-3">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
    </div>

    <nav>
      <router-link to="/" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100" active-class="bg-primary text-white">
        <Home class="h-4 w-4 mr-3" />
        Dashboard
      </router-link>

      <router-link to="/book" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100" active-class="bg-primary text-white">
        <Clock class="h-4 w-4 mr-3" />
        Book a Ride
      </router-link>

      <router-link to="/current-booking" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100" active-class="bg-primary text-white">
        <MapPin class="h-4 w-4 mr-3" />
        Current Booking
        <v-badge
          v-if="hasActiveBooking"
          color="error"
          dot
          class="ml-2"
        ></v-badge>
      </router-link>

      <router-link to="/drivers" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100" active-class="bg-primary text-white">
        <Users class="h-4 w-4 mr-3" />
        Drivers
      </router-link>

      <router-link to="/trip-history" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100" active-class="bg-primary text-white">
        <Calendar class="h-4 w-4 mr-3" />
        Trip History
      </router-link>

      <router-link to="/settings" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100" active-class="bg-primary text-white">
        <Settings class="h-4 w-4 mr-3" />
        Settings
      </router-link>
    </nav>

    <div class="mt-8">
      <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100" @click="handleLogout">
        <LogOut class="h-4 w-4 mr-3 text-gray-500" />
        Logout
      </a>
    </div>
  </aside>
</template>

<script setup>
import { ref, inject, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Home, Clock, Users, Calendar, Settings, LogOut, MapPin } from 'lucide-vue-next'
import { supabase } from '@/supabase'

const router = useRouter()
const appName = inject('appName')
const hasActiveBooking = ref(false)
const user = inject('user')

const checkActiveBooking = async () => {
  try {
    const { data: tripData, error } = await supabase
      .from('trips')
      .select('id')
      .eq('user_id', user.value.id)
      .in('status', ['pending', 'in_progress'])
      .limit(1)
      .single()

    if (error) throw error
    hasActiveBooking.value = !!tripData
  } catch (error) {
    console.error('Error checking active booking:', error)
    hasActiveBooking.value = false
  }
}

const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    router.push('/login')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

onMounted(() => {
  checkActiveBooking()
  // Set up real-time subscription for trip status changes
  const subscription = supabase
    .channel('trips')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'trips',
        filter: `user_id=eq.${user.value.id}`
      }, 
      () => {
        checkActiveBooking()
      }
    )
    .subscribe()

  // Cleanup subscription on component unmount
  onUnmounted(() => {
    subscription.unsubscribe()
  })
})
</script>

<style scoped>
.router-link-active {
  background-color: var(--v-primary-base);
  color: white;
}

.router-link-active .h-4 {
  color: white !important;
}
</style>