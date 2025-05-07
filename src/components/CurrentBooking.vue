<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/supabase'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const loading = ref(true)
const errorMessage = ref('')
const currentBooking = ref(null)
const driverDetails = ref(null)
const showMap = ref(true)
const map = ref(null)
const zoom = ref(13)
const center = ref([8.9475, 125.5406]) // Butuan City coordinates
const successMessage = ref('')

// Status colors and icons
const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'warning'
    case 'in_progress': return 'info'
    case 'completed': return 'success'
    case 'cancelled': return 'error'
    default: return 'grey'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return 'mdi-clock-outline'
    case 'in_progress': return 'mdi-car-connected'
    case 'completed': return 'mdi-check-circle'
    case 'cancelled': return 'mdi-close-circle'
    default: return 'mdi-help-circle'
  }
}

// Fetch current booking
const fetchCurrentBooking = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    // Get the most recent trip for the user
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .select(`
        *,
        bookings (
          *,
          drivers (*)
        )
      `)
      .eq('user_id', props.user.id)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (tripError) {
      if (tripError.code === 'PGRST116') {
        // No booking found - this is not an error
        currentBooking.value = null
        return
      }
      throw tripError
    }

    if (tripData) {
      currentBooking.value = tripData
      driverDetails.value = tripData.bookings?.[0]?.drivers
      
      // Center map on pickup location
      if (tripData.start_lat && tripData.start_lng) {
        center.value = [tripData.start_lat, tripData.start_lng]
      }
    }
  } catch (error) {
    console.error('Error fetching current booking:', error)
    errorMessage.value = 'Unable to load your booking. Please try again later.'
  } finally {
    loading.value = false
  }
}

// Confirm trip completion
const confirmTripCompletion = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Update trip status
    const { error: tripError } = await supabase
      .from('trips')
      .update({ status: 'completed' })
      .eq('id', currentBooking.value.id)

    if (tripError) throw tripError

    // Update booking status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'completed' })
      .eq('trip_id', currentBooking.value.id)

    if (bookingError) throw bookingError

    // Update driver status
    const { error: driverError } = await supabase
      .from('drivers')
      .update({ status: 'available' })
      .eq('id', driverDetails.value.id)

    if (driverError) throw driverError

    successMessage.value = 'Booking marked as completed! You can view it in your Trip History.'
    
    // Clear current booking immediately
    currentBooking.value = null
    driverDetails.value = null
    
    // Refresh booking data after a short delay
    setTimeout(fetchCurrentBooking, 1000)
  } catch (error) {
    console.error('Error confirming trip completion:', error)
    errorMessage.value = 'Failed to confirm trip completion'
  } finally {
    loading.value = false
  }
}

// Cancel trip
const cancelTrip = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    successMessage.value = ''

    // Update trip status
    const { error: tripError } = await supabase
      .from('trips')
      .update({ status: 'cancelled' })
      .eq('id', currentBooking.value.id)

    if (tripError) throw tripError

    // Update booking status
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('trip_id', currentBooking.value.id)

    if (bookingError) throw bookingError

    // Update driver status
    const { error: driverError } = await supabase
      .from('drivers')
      .update({ status: 'available' })
      .eq('id', driverDetails.value.id)

    if (driverError) throw driverError

    // Refresh booking data
    await fetchCurrentBooking()
    successMessage.value = 'Booking cancelled. You can view it in your Trip History.'
  } catch (error) {
    console.error('Error cancelling trip:', error)
    errorMessage.value = 'Failed to cancel trip'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchCurrentBooking()
})

// Watch for changes in booking status
watch(() => currentBooking.value?.status, async (newStatus) => {
  if (newStatus === 'completed' || newStatus === 'cancelled') {
    // Refresh the booking data after a short delay
    setTimeout(fetchCurrentBooking, 2000)
  }
})
</script>

<template>
  <div>
    <div class="booking-card">
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold d-flex align-center text-white">
          <v-icon class="mr-2" color="#fdbb2d">mdi-car-3-plus</v-icon>
          Current Booking
        </v-card-title>
        <v-card-subtitle class="text-subtitle-1 text-white opacity-80 mt-1">Track your active booking</v-card-subtitle>
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
            @click:close="errorMessage = ''"
          >
            <div class="d-flex align-center">
              <v-icon size="large" class="mr-3">mdi-alert-circle-outline</v-icon>
              <div class="font-weight-medium">{{ errorMessage }}</div>
            </div>
          </v-alert>
        </v-slide-y-transition>
        
        <v-slide-y-transition>
          <v-alert
            v-if="successMessage"
            type="success"
            variant="tonal"
            closable
            class="mb-4 rounded-lg"
            border="start"
            @click:close="successMessage = ''"
          >
            <div class="d-flex align-center">
              <v-icon size="large" class="mr-3">mdi-check-circle-outline</v-icon>
              <div class="font-weight-medium">{{ successMessage }}</div>
            </div>
          </v-alert>
        </v-slide-y-transition>
        
        <div v-if="loading" class="d-flex flex-column align-center justify-center my-8">
          <v-progress-circular indeterminate color="#fdbb2d" size="48" width="4"></v-progress-circular>
          <div class="text-white mt-4">Loading your booking details...</div>
        </div>
        
        <div v-else-if="!currentBooking" class="text-center my-8 pa-8 rounded-lg no-booking-container">
          <v-icon size="64" color="rgba(255, 255, 255, 0.7)" class="mb-4">mdi-car-off</v-icon>
          <div class="text-h6 text-white mb-2">No Active Booking</div>
          <div class="text-body-1 text-white opacity-80 mb-4">You don't have any active bookings at the moment</div>
          <v-btn
            color="#fdbb2d"
            variant="elevated"
            class="px-6 gradient-btn"
            to="/dashboard"
            size="large"
          >
            <v-icon start>mdi-plus</v-icon>
            Book a Ride
          </v-btn>
        </div>
        
        <template v-else>
          <!-- Booking Status -->
          <div class="status-container mb-6">
            <v-chip
              :color="getStatusColor(currentBooking.status)"
              size="large"
              class="text-capitalize"
              :prepend-icon="getStatusIcon(currentBooking.status)"
            >
              {{ currentBooking.status.replace('_', ' ') }}
            </v-chip>
          </div>
          
          <!-- Driver Details -->
          <div class="glass-container mb-6" v-if="driverDetails">
            <v-card-title class="text-h6 text-white">Driver Information</v-card-title>
            <v-card-text>
              <div class="d-flex align-center mb-4">
                <v-avatar
                  :color="driverDetails.rickshaw_type === 'standard' ? 'primary' : 'secondary'"
                  class="text-white mr-3"
                  size="48"
                >
                  <v-icon size="24">
                    {{ driverDetails.rickshaw_type === 'standard' ? 'mdi-car-3-plus' : 'mdi-car-estate' }}
                  </v-icon>
                </v-avatar>
                <div>
                  <div class="text-h6 text-white font-weight-medium">{{ driverDetails.name }}</div>
                  <div class="text-subtitle-2 text-white opacity-70">{{ driverDetails.plate_number }}</div>
                </div>
              </div>
              
              <v-chip
                size="small"
                :color="driverDetails.rickshaw_type === 'standard' ? 'primary' : 'secondary'"
                class="text-white"
                variant="flat"
              >
                {{ driverDetails.rickshaw_type === 'standard' ? 'Standard Auto' : 'Deluxe Auto' }}
              </v-chip>
            </v-card-text>
          </div>
          
          <!-- Trip Details -->
          <div class="glass-container mb-6">
            <v-card-title class="text-h6 text-white">Trip Details</v-card-title>
            <v-card-text>
              <div class="d-flex align-center mb-4">
                <v-icon color="#fdbb2d" class="mr-2">mdi-map-marker</v-icon>
                <div>
                  <div class="text-subtitle-2 text-white opacity-70">Pickup Location</div>
                  <div class="text-body-1 text-white">{{ currentBooking.start_point_name }}</div>
                </div>
              </div>
              
              <div class="d-flex align-center">
                <v-icon color="#fdbb2d" class="mr-2">mdi-map-marker-check</v-icon>
                <div>
                  <div class="text-subtitle-2 text-white opacity-70">Destination</div>
                  <div class="text-body-1 text-white">{{ currentBooking.end_point_name }}</div>
                </div>
              </div>
            </v-card-text>
          </div>
          
          <!-- Route Map -->
          <div class="glass-container mb-6">
            <v-card-title class="text-h6 text-white">Route Map</v-card-title>
            <v-card-text>
              <div class="map-container">
                <l-map
                  v-model="map"
                  :zoom="zoom"
                  :center="center"
                >
                  <l-tile-layer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    layer-type="base"
                    name="OpenStreetMap"
                  ></l-tile-layer>
                  
                  <l-marker
                    v-if="currentBooking.start_lat && currentBooking.start_lng"
                    :lat-lng="[currentBooking.start_lat, currentBooking.start_lng]"
                  >
                    <l-popup>Pickup Location</l-popup>
                  </l-marker>
                  
                  <l-marker
                    v-if="currentBooking.end_lat && currentBooking.end_lng"
                    :lat-lng="[currentBooking.end_lat, currentBooking.end_lng]"
                  >
                    <l-popup>Destination</l-popup>
                  </l-marker>
                </l-map>
              </div>
            </v-card-text>
          </div>
          
          <!-- Action Buttons -->
          <div class="d-flex justify-end gap-4" v-if="currentBooking.status === 'in_progress' || currentBooking.status === 'pending'">
            <v-btn
              color="error"
              variant="elevated"
              @click="cancelTrip"
              :loading="loading"
              class="px-6 action-btn"
              size="large"
            >
              <v-icon start>mdi-close</v-icon>
              Cancel Booking
            </v-btn>
            
            <v-btn
              color="success"
              variant="elevated"
              @click="confirmTripCompletion"
              :loading="loading"
              class="px-6 action-btn"
              size="large"
            >
              <v-icon start>mdi-check</v-icon>
              Complete Booking
            </v-btn>
          </div>
        </template>
      </v-card-text>
    </div>
  </div>
</template>

<style scoped>
.booking-card {
  width: 100%;
  padding: 40px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.65);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.booking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
}

.booking-card::before {
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

.no-booking-container {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.no-booking-container:hover {
  background: rgba(0, 0, 0, 0.6);
  border-color: rgba(255, 255, 255, 0.3);
}

.map-container {
  height: 300px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.status-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

:deep(.leaflet-container) {
  background: #242424;
}

:deep(.leaflet-popup-content-wrapper) {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  backdrop-filter: blur(10px);
}

:deep(.leaflet-popup-tip) {
  background: rgba(0, 0, 0, 0.8);
}

:deep(.leaflet-control-zoom) {
  border: none !important;
  background: rgba(0, 0, 0, 0.8) !important;
  backdrop-filter: blur(10px);
}

:deep(.leaflet-control-zoom a) {
  color: white !important;
  background: transparent !important;
  border: none !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background: rgba(255, 255, 255, 0.1) !important;
}

.action-btn {
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: none;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.gradient-btn {
  background: linear-gradient(90deg, #1a2a6c, #b21f1f, #fdbb2d) !important;
  background-size: 200% auto !important;
  transition: all 0.5s ease !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  letter-spacing: 1px !important;
}

.gradient-btn:hover {
  background-position: right center !important;
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3) !important;
  transform: translateY(-2px) !important;
}
</style> 