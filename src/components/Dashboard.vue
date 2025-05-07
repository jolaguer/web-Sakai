<script setup>
import { ref, inject, onMounted, computed, watch } from 'vue'
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
const showWelcome = ref(false)
const welcomeMessage = ref('')

// Navigation items
const items = [
  { title: 'Book an Auto', value: 'booking', icon: 'mdi-car-outline', color: 'blue-darken-4' },
  { title: 'Available Drivers', value: 'drivers', icon: 'mdi-account-group-outline', color: 'red-darken-1' },
  { title: 'Trip History', value: 'history', icon: 'mdi-history', color: 'amber-darken-2' }
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

    // Show welcome animation after loading
    setTimeout(() => {
      loading.value = false
      setTimeout(() => {
        showWelcome.value = true
        welcomeMessage.value = `Welcome, ${userName.value}!`
      }, 300)
    }, 800)
  } catch (error) {
    console.error('Error loading user data:', error)
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

// Close welcome message after 4 seconds
watch(showWelcome, (newVal) => {
  if (newVal) {
    setTimeout(() => {
      showWelcome.value = false
    }, 4000)
  }
})
</script>

<template>
  <v-app>
    <!-- App Bar -->
    <v-app-bar 
      flat 
      elevation="0"
      class="border-b modern-app-bar"
    >
      <v-container class="d-flex align-center py-0 px-4">
        <div class="d-flex align-center">
          <v-icon
            icon="mdi-car-3-plus"
            class="me-2 text-h5 logo-icon"
            color="blue-darken-4"
          ></v-icon>
          <v-app-bar-title class="font-weight-bold app-title">
            BajajExpress
          </v-app-bar-title>
        </div>
        
        <v-spacer></v-spacer>
        
        <v-avatar class="hidden-sm-and-down" color="blue-lighten-5" size="40">
          <span class="text-blue-darken-4 font-weight-medium">{{ userName.charAt(0) }}</span>
        </v-avatar>
      </v-container>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      @click="rail = false"
      color="white"
      elevation="1"
      width="280"
      class="modern-drawer"
    >
      <div class="pa-4 mb-4">
        <div class="d-flex align-center">
          <v-avatar v-if="!rail" color="amber-lighten-4" size="42" class="me-3">
            <span class="text-amber-darken-4 font-weight-medium">{{ userName.charAt(0) }}</span>
          </v-avatar>
          <div v-if="!rail">
            <div class="text-subtitle-1 font-weight-bold">{{ userName }}</div>
            <div class="text-caption text-medium-emphasis">{{ user?.email || 'user@example.com' }}</div>
          </div>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            :icon="rail ? 'mdi-menu-open' : 'mdi-menu'"
            @click.stop="rail = !rail"
            size="small"
            color="blue-darken-4"
            class="drawer-toggle"
          ></v-btn>
        </div>
      </div>

      <v-divider class="mx-3 mb-2"></v-divider>
      
      <div class="px-4 py-3" v-if="!rail">
        <v-card
          variant="flat"
          class="profile-card rounded-xl"
        >
          <v-img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download.jpg-pvUUUs3UPbD2GSn0jXsqMeEtME8k5S.jpeg"
            height="140"
            class="profile-image"
            cover
          >
            <template v-slot:placeholder>
              <div class="d-flex align-center justify-center fill-height">
                <v-progress-circular
                  indeterminate
                  color="amber-lighten-4"
                ></v-progress-circular>
              </div>
            </template>
          </v-img>
        </v-card>
      </div>

      <v-list nav class="px-2 py-2">
        <v-list-item
          v-for="(item, index) in items"
          :key="item.value"
          :value="item.value"
          :title="item.title"
          :prepend-icon="item.icon"
          :active="activeTab === item.value"
          @click="activeTab = item.value"
          :color="item.color"
          class="mb-2 nav-item"
          rounded="lg"
          :style="{ animationDelay: `${(index + 1) * 0.1}s` }"
          :class="{ 'active-nav-item': activeTab === item.value }"
        ></v-list-item>
      </v-list>
      
      <template v-slot:append>
        <div class="pa-4" v-if="!rail">
          <!-- Sign Out Button -->
          <v-btn
            block
            prepend-icon="mdi-logout"
            class="text-none logout-button"
            elevation="1"
            @click="handleLogout"
          >
            Sign Out
          </v-btn>
        </div>
        
        <!-- Sign out icon button for rail mode -->
        <div class="px-2 py-4" v-if="rail">
          <v-tooltip text="Sign Out" location="right">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                icon="mdi-logout"
                variant="tonal"
                color="red-darken-1"
                size="small"
                @click="handleLogout"
                class="mb-2"
              ></v-btn>
            </template>
          </v-tooltip>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Welcome Overlay -->
    <v-dialog
      v-model="showWelcome"
      persistent
      :scrim="false"
      max-width="400"
      transition="dialog-bottom-transition"
      content-class="welcome-dialog"
    >
      <v-card
        elevation="10"
        class="welcome-card pa-2"
        color="white"
      >
        <v-card-text class="text-center pa-6">
          <v-avatar color="blue-lighten-5" size="64" class="mb-4">
            <v-icon
              icon="mdi-hand-wave"
              color="blue-darken-4"
              size="x-large"
              class="welcome-icon"
            ></v-icon>
          </v-avatar>
          <div class="text-h5 font-weight-bold mb-2 welcome-text">{{ welcomeMessage }}</div>
          <div class="text-body-1 text-medium-emphasis">Ready for your next ride?</div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Main Content -->
    <v-main class="modern-bg">
      <v-container fluid class="pa-6">
        <v-fade-transition mode="out-in">
          <div v-if="loading" class="d-flex justify-center align-center" style="height: 80vh">
            <v-progress-circular indeterminate color="blue-darken-4" size="64"></v-progress-circular>
          </div>
          
          <div v-else class="content-container">
            <v-slide-y-transition mode="out-in">
              <component 
                :is="activeTab === 'booking' ? VehicleBooking : 
                     activeTab === 'drivers' ? DriverList : 
                     TripHistory"
                :user="activeTab !== 'drivers' ? user : undefined"
                :key="activeTab"
              />
            </v-slide-y-transition>
          </div>
        </v-fade-transition>
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
/* Modern color scheme and styling with gradients like the login form */
.modern-app-bar {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.modern-drawer {
  background: rgba(255, 255, 255, 0.15);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(5px);
}

.modern-bg {
  background: linear-gradient(135deg, rgba(26, 42, 108, 0.3), rgba(178, 31, 31, 0.2), rgba(253, 187, 45, 0.3));
  min-height: 100vh;
  position: relative;
}

.modern-bg::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d);
  z-index: -1;
  opacity: 0.2;
}

.app-title {
  background: linear-gradient(90deg, #1a2a6c, #b21f1f, #fdbb2d);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.logo-icon {
  animation: gentlePulse 3s infinite;
}

@keyframes gentlePulse {
  0% {
    opacity: 0.9;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
  100% {
    opacity: 0.9;
    transform: scale(1);
  }
}

.nav-item {
  animation: slideInRight 0.5s ease-out forwards;
  opacity: 0;
  transform: translateX(-20px);
  transition: all 0.2s ease;
  margin-bottom: 8px;
  font-weight: 500;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateX(3px);
}

.active-nav-item {
  background: rgba(255, 255, 255, 0.15);
  font-weight: 600;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.content-container {
  animation: fadeIn 0.8s ease-out;
  max-width: 1200px;
  margin: 0 auto;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.welcome-card {
  animation: welcomeFadeIn 0.5s ease-in-out;
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
}

@keyframes welcomeFadeIn {
  0% {
    transform: translateY(20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.welcome-icon {
  animation: wave 1.5s ease-in-out infinite;
  display: inline-block;
}

@keyframes wave {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(15deg);
  }
  50% {
    transform: rotate(0deg);
  }
  75% {
    transform: rotate(-15deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

.welcome-text {
  background: linear-gradient(90deg, #1a2a6c, #b21f1f, #fdbb2d);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.profile-card {
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.profile-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
}

.profile-image {
  transition: transform 0.5s ease;
  border-radius: 16px;
}

.profile-image:hover {
  transform: scale(1.02);
}

.logout-button {
  background: linear-gradient(90deg, #1a2a6c, #b21f1f, #fdbb2d) !important;
  background-size: 200% auto !important;
  transition: all 0.5s ease !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  letter-spacing: 1px !important;
  height: 48px !important;
  border-radius: 8px !important;
}

.logout-button:hover {
  background-position: right center !important;
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3) !important;
  transform: translateY(-2px) !important;
}

.drawer-toggle {
  transition: all 0.2s ease;
}

.drawer-toggle:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: rotate(180deg);
}
</style>