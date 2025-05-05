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
    case 'pending': return 'warning'
    case 'accepted': return 'info'
    case 'completed': return 'success'
    case 'cancelled': return 'error'
    default: return 'grey'
  }
}

const getRickshawColor = (type) => {
  return type === 'standard' ? 'amber-darken-1' : 'red-darken-1'
}
</script>

<template>
  <div>
    <v-card>
      <v-card-title class="text-h5 font-weight-bold d-flex align-center">
        <v-icon class="mr-2">mdi-history</v-icon>
        Auto Rickshaw Trip History
      </v-card-title>
      
      <v-card-text>
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>
        
        <div v-if="loading" class="d-flex justify-center my-8">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </div>
        
        <div v-else-if="trips.length === 0" class="text-center my-8">
          <v-icon icon="mdi-calendar-blank" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
          <div class="text-h6 text-medium-emphasis">No trips found</div>
          <div class="text-body-1 text-medium-emphasis">You haven't booked any auto rickshaw trips yet.</div>
        </div>
        
        <v-timeline v-else side="end" align="start" class="mt-4">
          <v-timeline-item
            v-for="trip in trips"
            :key="trip.id"
            :dot-color="trip.bookings && trip.bookings.length > 0 ? getStatusColor(trip.bookings[0].status) : 'grey'"
            size="small"
          >
            <template v-slot:opposite>
              <div class="text-caption">{{ formatDate(trip.created_at) }}</div>
            </template>
            
            <v-card variant="outlined" class="mb-4">
              <v-card-item>
                <v-card-title>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-map-marker" class="mr-2"></v-icon>
                    {{ trip.start_point_name }}
                  </div>
                </v-card-title>
                
                <v-card-subtitle>
                  <div class="d-flex align-center">
                    <v-icon icon="mdi-map-marker-check" class="mr-2"></v-icon>
                    {{ trip.end_point_name }}
                  </div>
                </v-card-subtitle>
              </v-card-item>
              
              <v-divider></v-divider>
              
              <v-card-text v-if="trip.bookings && trip.bookings.length > 0">
                <div class="d-flex justify-space-between align-center">
                  <div>
                    <div class="d-flex align-center mb-2">
                      <v-icon icon="mdi-account" class="mr-2" size="small"></v-icon>
                      <span class="text-body-2">
                        {{ trip.bookings[0].drivers?.name || 'Unknown Driver' }}
                      </span>
                    </div>
                    
                    <div class="d-flex align-center">
                      <v-avatar 
                        :color="getRickshawColor(trip.bookings[0].drivers?.rickshaw_type || 'standard')" 
                        size="20" 
                        class="mr-2 text-white"
                      >
                        <v-icon size="x-small">mdi-car-3-plus</v-icon>
                      </v-avatar>
                      <span class="text-body-2 text-capitalize">
                        {{ trip.bookings[0].drivers?.rickshaw_type || 'Standard' }} Auto
                      </span>
                    </div>
                  </div>
                  
                  <v-chip
                    :color="getStatusColor(trip.bookings[0].status)"
                    size="small"
                    class="text-capitalize"
                  >
                    {{ trip.bookings[0].status.replace('-', ' ') }}
                  </v-chip>
                </div>
              </v-card-text>
              
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  variant="text"
                  color="primary"
                  size="small"
                  prepend-icon="mdi-information-outline"
                >
                  Details
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </v-card-text>
    </v-card>
  </div>
</template>