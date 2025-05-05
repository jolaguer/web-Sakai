<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'
import VehicleBooking from './VehicleBooking.vue'
import TripHistory from './TripHistory.vue'
import DriverList from './DriverList.vue'

const router = useRouter()
const drawer = ref(true)
const rail = ref(false)
const activeTab = ref('booking')
const user = ref(null)
const loading = ref(true)

// Navigation items
const items = [
  { title: 'Book an Auto', value: 'booking', icon: 'mdi-car-3-plus' },
  { title: 'Available Drivers', value: 'drivers', icon: 'mdi-account-group' },
  { title: 'Trip History', value: 'history', icon: 'mdi-history' }
]

onMounted(async () => {
  try {
    loading.value = true
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/')
      return
    }
    
    user.value = authUser
    
    // Fetch user profile if needed
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
      
    if (profile) {
      user.value = { ...user.value, profile }
    }
  } catch (error) {
    console.error('Error loading user data:', error)
  } finally {
    loading.value = false
  }
})

const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
  }
}

const userName = computed(() => {
  if (!user.value) return 'User'
  return user.value.user_metadata?.first_name || user.value.email?.split('@')[0] || 'User'
})
</script>

<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar color="#FFC107" density="compact">
      <v-app-bar-title class="text-black font-weight-bold">
        <v-icon class="mr-2">mdi-car-3-plus</v-icon>
        BajajExpress Auto
      </v-app-bar-title>
      <v-spacer></v-spacer>
      
      <v-btn icon @click="handleLogout" variant="text" color="black">
        <v-icon>mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
      color="#FFF8E1"
    >
      <v-list-item
        :prepend-avatar="user?.user_metadata?.avatar_url || ''"
        :title="userName"
        :subtitle="user?.email || ''"
      >
        <template v-slot:append>
          <v-btn
            variant="text"
            icon="mdi-chevron-left"
            @click.stop="rail = !rail"
          ></v-btn>
        </template>
      </v-list-item>

      <v-divider></v-divider>
      
      <div class="pa-2">
        <v-img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download.jpg-pvUUUs3UPbD2GSn0jXsqMeEtME8k5S.jpeg"
          height="120"
          class="rounded-lg"
          cover
        ></v-img>
      </div>

      <v-list density="compact" nav>
        <v-list-item
          v-for="item in items"
          :key="item.value"
          :value="item.value"
          :title="item.title"
          :prepend-icon="item.icon"
          :active="activeTab === item.value"
          @click="activeTab = item.value"
          :active-color="activeTab === item.value ? 'amber-darken-2' : ''"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>

    <!-- Main Content -->
    <v-main>
      <v-container fluid>
        <v-fade-transition mode="out-in">
          <div v-if="loading" class="d-flex justify-center align-center" style="height: 80vh">
            <v-progress-circular indeterminate color="amber-darken-2" size="64"></v-progress-circular>
          </div>
          
          <div v-else>
            <VehicleBooking v-if="activeTab === 'booking'" :user="user" />
            <DriverList v-else-if="activeTab === 'drivers'" />
            <TripHistory v-else-if="activeTab === 'history'" :user="user" />
          </div>
        </v-fade-transition>
      </v-container>
    </v-main>
  </v-app>
</template>