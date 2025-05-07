<script setup>
import { ref, inject, onMounted } from 'vue'
import { supabase } from '@/supabase'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const loading = ref(true)
const trips = ref([])
const errorMessage = ref('')

onMounted(async () => {
  await fetchTripHistory()
})

const fetchTripHistory = async () => {
  try {
    loading.value = true
    
    // Fetch trips with booking and driver information
    const { data, error } = await supabase
      .from('trips')
      .select(`
        *,
        bookings (
          *,
          drivers (*)
        )
      `)
      .eq('user_id', props.user.id)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    trips.value = data || []
  } catch (error) {
    console.error('Error fetching trip history:', error)
    errorMessage.value = 'Failed to load trip history'
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'amber-darken-2'
    case 'accepted': return 'blue'
    case 'completed': return 'success'
    case 'cancelled': return 'error'
    default: return 'grey'
  }
}

const getRickshawColor = (type) => {
  return type === 'standard' ? 'rgba(26, 42, 108, 0.8)' : 'rgba(178, 31, 31, 0.8)'
}

const getRickshawTextColor = (type) => {
  return 'text-white'
}

// Trip types for icons/colors
const getTripIcon = (status) => {
  switch (status) {
    case 'pending': return 'mdi-clock-outline'
    case 'accepted': return 'mdi-car-clock'
    case 'completed': return 'mdi-check-circle-outline'
    case 'cancelled': return 'mdi-close-circle-outline'
    default: return 'mdi-help-circle-outline'
  }
}
</script>

<template>
  <div>
    <div class="trips-card">
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold d-flex align-center text-white">
          <v-icon class="mr-2" color="#fdbb2d">mdi-history</v-icon>
          Auto Rickshaw Trip History
        </v-card-title>
        <v-card-subtitle class="text-subtitle-1 text-white opacity-80 mt-1">View details of your past and upcoming trips</v-card-subtitle>
      </v-card-item>
      
      <v-card-text>
        <v-slide-y-transition>
          <v-alert
            v-if="errorMessage"
            type="error"
            variant="tonal"
            closable
            class="mb-4 rounded-lg"
            border="start"
          >
            <div class="d-flex align-center">
              <v-icon size="large" class="mr-3">mdi-alert-circle-outline</v-icon>
              <div class="font-weight-medium">{{ errorMessage }}</div>
            </div>
          </v-alert>
        </v-slide-y-transition>
        
        <div class="glass-container mb-6">
          <v-img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download.jpg-pvUUUs3UPbD2GSn0jXsqMeEtME8k5S.jpeg"
            height="150"
            class="rounded-lg"
            cover
            gradient="to bottom, rgba(26, 42, 108, 0.3), rgba(178, 31, 31, 0.3), rgba(253, 187, 45, 0.3)"
            alt="Auto Rickshaws"
          >
            <div class="fill-height d-flex align-end">
              <div class="pa-6 text-white">
                <div class="text-h6 font-weight-bold">Your Journey History</div>
                <div class="text-subtitle-2">All your trips in one place</div>
              </div>
            </div>
          </v-img>
        </div>
        
        <div v-if="loading" class="d-flex justify-center my-8">
          <v-progress-circular indeterminate color="#fdbb2d" size="48" width="4"></v-progress-circular>
        </div>
        
        <div v-else-if="trips.length === 0" class="text-center my-8 pa-8 rounded-lg no-trips-container">
          <v-icon size="48" color="rgba(255, 255, 255, 0.7)" class="mb-4">mdi-calendar-blank</v-icon>
          <div class="text-body-1 text-white opacity-80">No trips found in your history</div>
          <div class="text-caption text-white opacity-60 mt-2">You haven't booked any auto rickshaw trips yet.</div>
        </div>
        
        <div v-else>
          <!-- Desktop Timeline View (md and up) -->
          <v-timeline v-if="$vuetify.display.mdAndUp" side="end" align="start" class="mt-4 timeline-dark">
            <v-timeline-item
              v-for="trip in trips"
              :key="trip.id"
              :dot-color="trip.bookings && trip.bookings.length > 0 ? getStatusColor(trip.bookings[0].status) : 'grey'"
              size="small"
            >
              <template v-slot:opposite>
                <div class="text-caption font-weight-medium text-white opacity-80">{{ formatDate(trip.created_at) }}</div>
              </template>
              
              <div class="trip-card">
                <v-card-item>
                  <template v-slot:prepend>
                    <v-avatar :color="trip.bookings && trip.bookings.length > 0 ? getStatusColor(trip.bookings[0].status) + ' lighten-4' : 'grey-lighten-3'" 
                            class="text-dark" size="48">
                      <v-icon :color="trip.bookings && trip.bookings.length > 0 ? getStatusColor(trip.bookings[0].status) : 'grey'"
                             :icon="trip.bookings && trip.bookings.length > 0 ? getTripIcon(trip.bookings[0].status) : 'mdi-help-circle-outline'"></v-icon>
                    </v-avatar>
                  </template>
                  
                  <v-card-title class="text-white font-weight-bold pb-1">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-map-marker" class="mr-2" size="small" color="#fdbb2d"></v-icon>
                      {{ trip.start_point_name }}
                    </div>
                  </v-card-title>
                  
                  <v-card-subtitle class="text-white opacity-80 pt-1">
                    <div class="d-flex align-center">
                      <v-icon icon="mdi-map-marker-check" class="mr-2" size="small" color="#fdbb2d"></v-icon>
                      {{ trip.end_point_name }}
                    </div>
                  </v-card-subtitle>
                </v-card-item>
                
                <v-divider class="opacity-20"></v-divider>
                
                <v-card-text v-if="trip.bookings && trip.bookings.length > 0" class="pt-3">
                  <div class="d-flex justify-space-between align-center">
                    <div>
                      <div class="d-flex align-center mb-2">
                        <v-avatar
                          :color="getRickshawColor(trip.bookings[0].drivers?.rickshaw_type || 'standard')"
                          class="text-white mr-2"
                          size="28"
                        >
                          <v-icon size="small">mdi-account</v-icon>
                        </v-avatar>
                        <span class="text-body-1 font-weight-medium text-white">
                          {{ trip.bookings[0].drivers?.name || 'Unknown Driver' }}
                        </span>
                      </div>
                      
                      <div class="d-flex align-center">
                        <v-avatar 
                          :color="getRickshawColor(trip.bookings[0].drivers?.rickshaw_type || 'standard')" 
                          class="text-white mr-2"
                          size="24" 
                        >
                          <v-icon size="x-small">mdi-car-3-plus</v-icon>
                        </v-avatar>
                        <span class="text-body-2 text-capitalize text-white opacity-80">
                          {{ trip.bookings[0].drivers?.rickshaw_type || 'Standard' }} Auto
                          <span class="text-caption ml-1 opacity-60" v-if="trip.bookings[0].drivers?.plate_number">
                            ({{ trip.bookings[0].drivers?.plate_number }})
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    <v-chip
                      :color="getStatusColor(trip.bookings[0].status)"
                      size="small"
                      class="text-capitalize"
                      variant="flat"
                      :prepend-icon="getTripIcon(trip.bookings[0].status)"
                    >
                      {{ trip.bookings[0].status.replace('-', ' ') }}
                    </v-chip>
                  </div>
                </v-card-text>
                
              </div>
            </v-timeline-item>
          </v-timeline>
          
          <!-- Mobile Card View (sm and down) -->
          <div v-else class="mt-4">
            <div
              v-for="trip in trips"
              :key="trip.id"
              class="mb-4 trip-card"
            >
              <v-card-item>
                <template v-slot:prepend>
                  <v-avatar :color="trip.bookings && trip.bookings.length > 0 ? getStatusColor(trip.bookings[0].status) + ' lighten-4' : 'grey-lighten-3'" 
                          class="text-dark" size="48">
                    <v-icon :color="trip.bookings && trip.bookings.length > 0 ? getStatusColor(trip.bookings[0].status) : 'grey'"
                           :icon="trip.bookings && trip.bookings.length > 0 ? getTripIcon(trip.bookings[0].status) : 'mdi-help-circle-outline'"></v-icon>
                  </v-avatar>
                </template>
                
                <v-card-title class="text-white font-weight-bold pb-0">
                  Trip on {{ formatDate(trip.created_at) }}
                </v-card-title>
                
                <v-card-subtitle class="text-white opacity-80 pt-1">
                  <v-chip
                    :color="trip.bookings && trip.bookings.length > 0 ? getStatusColor(trip.bookings[0].status) : 'grey'"
                    size="x-small"
                    class="text-capitalize"
                    variant="flat"
                  >
                    {{ trip.bookings && trip.bookings.length > 0 ? trip.bookings[0].status.replace('-', ' ') : 'Unknown' }}
                  </v-chip>
                </v-card-subtitle>
              </v-card-item>
              
              <v-card-text class="pt-0">
                <div class="d-flex align-center mb-2">
                  <v-icon icon="mdi-map-marker" class="mr-2" size="small" color="#fdbb2d"></v-icon>
                  <span class="text-body-2 text-white">{{ trip.start_point_name }}</span>
                </div>
                
                <div class="d-flex align-center">
                  <v-icon icon="mdi-map-marker-check" class="mr-2" size="small" color="#fdbb2d"></v-icon>
                  <span class="text-body-2 text-white">{{ trip.end_point_name }}</span>
                </div>
              </v-card-text>
              
              <v-divider class="opacity-20"></v-divider>
              
              <v-card-text v-if="trip.bookings && trip.bookings.length > 0" class="pt-3">
                <div class="d-flex align-center mb-1">
                  <v-avatar
                    :color="getRickshawColor(trip.bookings[0].drivers?.rickshaw_type || 'standard')"
                    class="text-white mr-2"
                    size="24"
                  >
                    <v-icon size="small">mdi-account</v-icon>
                  </v-avatar>
                  <span class="text-body-2 font-weight-medium text-white">
                    {{ trip.bookings[0].drivers?.name || 'Unknown Driver' }}
                  </span>
                </div>
                
                <div class="d-flex align-center">
                  <v-avatar 
                    :color="getRickshawColor(trip.bookings[0].drivers?.rickshaw_type || 'standard')" 
                    class="text-white mr-2"
                    size="20" 
                  >
                    <v-icon size="x-small">mdi-car-3-plus</v-icon>
                  </v-avatar>
                  <span class="text-caption text-capitalize text-white opacity-80">
                    {{ trip.bookings[0].drivers?.rickshaw_type || 'Standard' }} Auto
                    <span class="text-caption ml-1 opacity-60" v-if="trip.bookings[0].drivers?.plate_number">
                      ({{ trip.bookings[0].drivers?.plate_number }})
                    </span>
                  </span>
                </div>
              </v-card-text>
              
              <v-card-actions>
                <v-btn
                  variant="text"
                  color="#fdbb2d"
                  size="small"
                  prepend-icon="mdi-information-outline"
                  block
                  class="text-none"
                >
                  View Trip Details
                </v-btn>
              </v-card-actions>
            </div>
          </div>
          
          <!-- Pagination for future implementation -->
          <div class="d-flex justify-center mt-6">
            <v-pagination
              v-if="trips.length > 5"
              :length="Math.ceil(trips.length / 5)"
              :total-visible="5"
              color="#fdbb2d"
            ></v-pagination>
          </div>
        </div>
      </v-card-text>
    </div>
  </div>
</template>

<style scoped>
/* Add text enhancement styles */
.text-h5, .text-h6, .text-subtitle-1, .text-body-1 {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: 600;
}

.trips-card {
  width: 100%;
  padding: 40px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.65);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.trips-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(26, 42, 108, 0.5), rgba(178, 31, 31, 0.4), rgba(253, 187, 45, 0.5));
  z-index: -1;
  border-radius: 16px;
}

.glass-container {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.trip-card {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
}

.trip-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(253, 187, 45, 0.5);
}

.no-trips-container {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

/* Timeline dark styles */
.timeline-dark :deep(.v-timeline-divider) {
  background: rgba(255, 255, 255, 0.1);
}

.timeline-dark :deep(.v-timeline-item__body) {
  margin-bottom: 24px;
}
</style>