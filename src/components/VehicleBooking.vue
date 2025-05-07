<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const loading = ref(false)
const bookingSuccess = ref(false)
const errorMessage = ref('')

// Form data
const startPoint = ref('')
const endPoint = ref('')
const selectedDriverId = ref(null)
const selectedRickshawType = ref('standard')


// Data from database
const availableDrivers = ref([])
const filteredDrivers = computed(() => {
  return availableDrivers.value.filter(driver => 
    driver.status === 'available'
  )
})

onMounted(async () => {
  await fetchAvailableDrivers()
})

const fetchAvailableDrivers = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'available')
    
    if (error) throw error
    
    availableDrivers.value = data || []
  } catch (error) {
    console.error('Error fetching drivers:', error)
    errorMessage.value = 'Failed to load available drivers'
  } finally {
    loading.value = false
  }
}

const handleBooking = async () => {
  if (!startPoint.value || !endPoint.value || !selectedDriverId.value) {
    errorMessage.value = 'Please fill in all required fields'
    return
  }
  
  try {
    loading.value = true
    errorMessage.value = ''
    
    // 1. Create a new trip
    const { data: tripData, error: tripError } = await supabase
      .from('trips')
      .insert([
        {
          user_id: props.user.id,
          start_point_name: startPoint.value,
          end_point_name: endPoint.value,
          // You would add coordinates here in a real app
          start_lat: 0,
          start_lng: 0,
          end_lat: 0,
          end_lng: 0
        }
      ])
      .select()
    
    if (tripError) throw tripError
    
    const tripId = tripData[0].id
    
    // 2. Create a booking
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert([
        {
          driver_id: selectedDriverId.value,
          trip_id: tripId,
          status: 'pending'
        }
      ])
    
    if (bookingError) throw bookingError
    
    // 3. Update driver status
    const { error: driverError } = await supabase
      .from('drivers')
      .update({ status: 'on-trip' })
      .eq('id', selectedDriverId.value)
    
    if (driverError) throw driverError
    
    // Success
    bookingSuccess.value = true
    
    // Reset form
    startPoint.value = ''
    endPoint.value = ''
    selectedDriverId.value = null
    
    // Refresh drivers list
    await fetchAvailableDrivers()
    
  } catch (error) {
    console.error('Error creating booking:', error)
    errorMessage.value = 'Failed to create booking. Please try again.'
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  bookingSuccess.value = false
  errorMessage.value = ''
  startPoint.value = ''
  endPoint.value = ''
  selectedDriverId.value = null
}

// Helper function to determine rickshaw type color based on driver index
const getRickshawColor = (index) => {
  // Use gradient colors matching the login theme
  return index % 2 === 0 ? 'rgba(26, 42, 108, 0.8)' : 'rgba(178, 31, 31, 0.8)'
}

// Helper function to determine rickshaw type name based on driver index
const getRickshawType = (index) => {
  return index % 2 === 0 ? 'Standard' : 'Deluxe'
}
</script>

<template>
  <div>
    <div class="booking-card">
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold d-flex align-center text-white">
          <v-icon class="mr-2" color="#fdbb2d">mdi-car-3-plus</v-icon>
          Book an Auto Rickshaw
        </v-card-title>
        <v-card-subtitle class="text-subtitle-1 text-white opacity-80 mt-1">Safe & comfortable rides at your fingertips</v-card-subtitle>
      </v-card-item>
      
      <v-card-text>
        <v-slide-y-transition>
          <v-alert
            v-if="bookingSuccess"
            type="success"
            variant="tonal"
            closable
            class="mb-4 rounded-lg success-alert"
            border="start"
          >
            <div class="d-flex align-center">
              <v-icon size="large" class="mr-3">mdi-check-circle-outline</v-icon>
              <div>
                <div class="font-weight-medium text-h6">Booking successful!</div>
                <div class="text-body-2">Your auto rickshaw has been booked successfully. You can check the status in your trip history.</div>
              </div>
            </div>
            <v-btn
              class="mt-3 gradient-btn"
              variant="elevated"
              @click="resetForm"
              prepend-icon="mdi-plus"
            >
              Book another ride
            </v-btn>
          </v-alert>
        </v-slide-y-transition>
        
        <v-slide-y-transition>
          <v-alert
            v-if="errorMessage"
            density="compact"
            variant="tonal"
            type="error"
            class="mb-4 rounded-lg"
            border="start"
            icon="mdi-alert-circle"
          >
            {{ errorMessage }}
          </v-alert>
        </v-slide-y-transition>
        
        <div v-if="!bookingSuccess" class="glass-container mb-6">
          <v-img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download.jpg-pvUUUs3UPbD2GSn0jXsqMeEtME8k5S.jpeg"
            height="250"
            class="rounded-lg"
            cover
            gradient="to bottom, rgba(26, 42, 108, 0.3), rgba(178, 31, 31, 0.3), rgba(253, 187, 45, 0.3)"
            alt="Auto Rickshaws"
          >
            <div class="fill-height d-flex align-end">
              <div class="pa-6 text-white">
                <div class="text-h6 font-weight-bold">Choose Your Ride</div>
                <div class="text-subtitle-2">Premium services with professional drivers</div>
              </div>
            </div>
          </v-img>
        </div>
        
        <v-form v-if="!bookingSuccess" class="mt-6">
         
          
          <v-chip-group
            v-model="selectedRickshawType"
            selected-class="selected-type"
            mandatory
            class="mb-6 rickshaw-type-group"
          >
            <v-chip
              v-for="type in rickshawTypes"
              :key="type.value"
              :value="type.value"
              filter
              variant="elevated"
              :color="type.color"
              size="large"
              class="pa-6 type-chip"
            >
              <v-icon start size="large" class="mr-2">{{ type.icon }}</v-icon>
              {{ type.label }} Auto
            </v-chip>
          </v-chip-group>
          
          <v-row class="mt-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="startPoint"
                label="Pickup Location"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
                placeholder="Enter pickup address"
                :rules="[v => !!v || 'Pickup location is required']"
                bg-color="rgba(255, 255, 255, 0.1)"
                color="accent"
                class="rounded-lg input-field"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="endPoint"
                label="Destination"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker-check"
                placeholder="Enter destination address"
                :rules="[v => !!v || 'Destination is required']"
                bg-color="rgba(255, 255, 255, 0.1)"
                color="accent"
                class="rounded-lg input-field"
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-card-subtitle class="px-1 font-weight-bold text-uppercase text-white opacity-80 mt-6">
            Available Auto Rickshaw Drivers
          </v-card-subtitle>
          
          <div v-if="loading" class="d-flex justify-center my-8">
            <v-progress-circular indeterminate color="#fdbb2d" size="48" width="4"></v-progress-circular>
          </div>
          
          <div v-else-if="filteredDrivers.length === 0" class="text-center my-8 pa-8 rounded-lg no-drivers-container">
            <v-icon size="48" color="rgba(255, 255, 255, 0.7)" class="mb-4">mdi-car-off</v-icon>
            <div class="text-body-1 text-white opacity-80">No auto rickshaw drivers available at the moment.</div>
            <div class="text-caption text-white opacity-60 mt-2">Please try again later</div>
          </div>
          
          <v-row v-else>
            <v-col
              v-for="(driver, index) in filteredDrivers"
              :key="driver.id"
              cols="12"
              sm="6"
              md="4"
            >
              <div
                class="driver-card"
                :class="{ 'selected-driver': selectedDriverId === driver.id }"
                @click="selectedDriverId = driver.id"
              >
                <div class="d-flex align-items-center pa-4">
                  <v-avatar :color="getRickshawColor(index)" class="text-white mr-3" size="48">
                    <v-icon size="24">{{ index % 2 === 0 ? 'mdi-car-3-plus' : 'mdi-car-estate' }}</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 text-white font-weight-medium">{{ driver.name }}</div>
                    <div class="text-subtitle-2 text-white opacity-70">{{ driver.plate_number }}</div>
                  </div>
                </div>
                
                <v-card-text class="pb-0 pt-0">
                  <div class="d-flex align-center">
                    <v-rating
                      readonly
                      :model-value="4.7"
                      color="#fdbb2d"
                      size="small"
                      half-increments
                      density="compact"
                    ></v-rating>
                    <span class="ml-1 text-caption text-white opacity-80">4.7</span>
                  </div>
                </v-card-text>
                
                <v-card-text class="pt-0">
                  <v-chip
                    size="small"
                    color="success"
                    variant="flat"
                    prepend-icon="mdi-check-circle"
                  >
                    Available
                  </v-chip>
                  
                  <v-chip
                    size="small"
                    :color="getRickshawColor(index)"
                    class="ml-2 text-white"
                    variant="flat"
                  >
                    {{ getRickshawType(index) }}
                  </v-chip>
                </v-card-text>
                
                <v-divider class="opacity-20"></v-divider>
                
                <v-card-actions>
                  <v-btn
                    variant="text"
                    :color="selectedDriverId === driver.id ? '#fdbb2d' : 'white'"
                    block
                    class="text-none"
                  >
                    <v-icon start>{{ selectedDriverId === driver.id ? 'mdi-check' : 'mdi-cursor-pointer' }}</v-icon>
                    {{ selectedDriverId === driver.id ? 'Selected' : 'Select Driver' }}
                  </v-btn>
                </v-card-actions>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions v-if="!bookingSuccess" class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          size="large"
          :loading="loading"
          :disabled="loading || !startPoint || !endPoint || !selectedDriverId"
          @click="handleBooking"
          variant="elevated"
          class="px-6 font-weight-bold gradient-btn"
          rounded="pill"
        >
          <v-icon start class="mr-1">mdi-car-3-plus</v-icon>
          Book Auto Rickshaw
        </v-btn>
      </v-card-actions>
    </div>
  </div>
</template>

<style scoped>
/* Add text enhancement styles */
.text-h5, .text-h6, .text-subtitle-1, .text-body-1 {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-weight: 600;
}
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

.driver-card {
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

.driver-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(253, 187, 45, 0.5);
}

.selected-driver {
  background: rgba(0, 0, 0, 0.7);
  border: 2px solid rgba(253, 187, 45, 0.9);
  box-shadow: 0 0 15px rgba(253, 187, 45, 0.5);
}

.no-drivers-container {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.input-field :deep(.v-field__outline) {
  color: rgba(255, 255, 255, 0.5) !important;
}

.input-field :deep(.v-field__input) {
  color: #ffffff !important;
  font-weight: 500 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.input-field :deep(.v-field__field) {
  color: #ffffff !important;
}

.input-field :deep(.v-label) {
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.input-field :deep(.v-icon) {
  color: #fdbb2d !important;
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

.type-chip {
  color: #ffffff !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
  background: rgba(0, 0, 0, 0.4) !important;
  transition: all 0.3s ease !important;
  font-weight: 500 !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.selected-type {
  background: linear-gradient(90deg, #1a2a6c, #b21f1f, #fdbb2d) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4) !important;
  font-weight: 600 !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.7);
}

.success-alert {
  background: rgba(0, 0, 0, 0.6) !important;
  border-color: rgba(76, 175, 80, 0.9) !important;
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}
</style>