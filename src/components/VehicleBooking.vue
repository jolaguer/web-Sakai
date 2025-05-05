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
const selectedRickshawType = ref('standard')
const selectedDriverId = ref(null)

// Data from database
const availableDrivers = ref([])
const filteredDrivers = computed(() => {
  return availableDrivers.value.filter(driver => 
    driver.status === 'available'
  )
})

// Auto Rickshaw type options
const rickshawTypes = [
  { value: 'standard', label: 'Standard', icon: 'mdi-car-3-plus', color: 'yellow' },
  { value: 'deluxe', label: 'Deluxe', icon: 'mdi-car-3-plus', color: 'red' }
]

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
  // Alternate between yellow and red for visual variety
  return index % 2 === 0 ? 'amber-darken-1' : 'red-darken-1'
}

// Helper function to determine rickshaw type name based on driver index
const getRickshawType = (index) => {
  return index % 2 === 0 ? 'Standard' : 'Deluxe'
}
</script>

<template>
  <div>
    <v-card class="mb-6">
      <v-card-title class="text-h5 font-weight-bold d-flex align-center">
        <v-icon class="mr-2">mdi-car-3-plus</v-icon>
        Book an Auto Rickshaw
      </v-card-title>
      
      <v-card-text>
        <v-alert
          v-if="bookingSuccess"
          type="success"
          variant="tonal"
          closable
          class="mb-4"
        >
          <div class="d-flex align-center">
            <v-icon class="mr-2">mdi-check-circle</v-icon>
            <div>
              <div class="font-weight-medium">Booking successful!</div>
              <div class="text-body-2">Your auto rickshaw has been booked successfully. You can check the status in your trip history.</div>
            </div>
          </div>
          <v-btn
            class="mt-3"
            variant="text"
            color="success"
            @click="resetForm"
          >
            Book another ride
          </v-btn>
        </v-alert>
        
        <v-alert
          v-if="errorMessage"
          type="error"
          variant="tonal"
          closable
          class="mb-4"
        >
          {{ errorMessage }}
        </v-alert>
        
        <v-form v-if="!bookingSuccess">
          <v-card-subtitle class="px-0 font-weight-bold">
            Auto Rickshaw Type
          </v-card-subtitle>
          
          <div class="d-flex justify-center mb-6">
            <v-img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download.jpg-pvUUUs3UPbD2GSn0jXsqMeEtME8k5S.jpeg"
              max-width="400"
              class="rounded-lg"
              alt="Auto Rickshaws"
            ></v-img>
          </div>
          
          <!-- <v-chip-group
            v-model="selectedRickshawType"
            selected-class="bg-primary text-white"
            mandatory
          >
            <v-chip
              v-for="type in rickshawTypes"
              :key="type.value"
              :value="type.value"
              filter
              variant="elevated"
              :color="type.color === 'yellow' ? 'amber-darken-1' : 'red-darken-1'"
              class="text-white"
            >
              <v-icon start>{{ type.icon }}</v-icon>
              {{ type.label }} Auto
            </v-chip>
          </v-chip-group> -->
          
          <v-row class="mt-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="startPoint"
                label="Pickup Location"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
                placeholder="Enter pickup address"
                :rules="[v => !!v || 'Pickup location is required']"
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
              ></v-text-field>
            </v-col>
          </v-row>
          
          <v-card-subtitle class="px-0 font-weight-bold mt-4">
            Available Auto Rickshaw Drivers
          </v-card-subtitle>
          
          <div v-if="loading" class="d-flex justify-center my-4">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>
          </div>
          
          <div v-else-if="filteredDrivers.length === 0" class="text-center my-4 text-body-1 text-medium-emphasis">
            No auto rickshaw drivers available at the moment.
          </div>
          
          <v-row v-else>
            <v-col
              v-for="(driver, index) in filteredDrivers"
              :key="driver.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                :color="selectedDriverId === driver.id ? 'primary' : ''"
                :class="selectedDriverId === driver.id ? 'text-white' : ''"
                variant="outlined"
                @click="selectedDriverId = driver.id"
                class="cursor-pointer"
              >
                <v-card-item>
                  <template v-slot:prepend>
                    <v-avatar :color="getRickshawColor(index)" class="text-white">
                      <v-icon>mdi-car-3-plus</v-icon>
                    </v-avatar>
                  </template>
                  
                  <v-card-title>{{ driver.name }}</v-card-title>
                  <v-card-subtitle :class="selectedDriverId === driver.id ? 'text-white' : ''">
                    {{ driver.plate_number }}
                  </v-card-subtitle>
                </v-card-item>
                
                <v-card-text>
                  <v-chip
                    size="small"
                    color="success"
                    :class="selectedDriverId === driver.id ? 'text-white' : ''"
                  >
                    Available
                  </v-chip>
                  
                  <v-chip
                    size="small"
                    :color="getRickshawColor(index)"
                    class="ml-2 text-white"
                  >
                    {{ getRickshawType(index) }}
                  </v-chip>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
      
      <v-card-actions v-if="!bookingSuccess">
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          size="large"
          :loading="loading"
          :disabled="loading || !startPoint || !endPoint || !selectedDriverId"
          @click="handleBooking"
        >
          <v-icon start>mdi-car-3-plus</v-icon>
          Book Auto Rickshaw
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>