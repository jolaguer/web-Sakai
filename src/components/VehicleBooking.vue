<script setup>
import { ref, inject, onMounted, computed, watch } from 'vue'
import { supabase } from '@/supabase'
import { LMap, LTileLayer, LMarker, LPopup, LControl } from '@vue-leaflet/vue-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { OpenStreetMapProvider } from 'leaflet-geosearch'

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// Custom marker icons
const currentLocationIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const loading = ref(false)
const bookingSuccess = ref(false)
const errorMessage = ref('')

// Map related state
const map = ref(null)
const zoom = ref(13)
const center = ref([8.9475, 125.5406]) // Butuan City coordinates
const startMarker = ref(null)
const endMarker = ref(null)
const showStartMap = ref(false)
const showEndMap = ref(false)
const searchQuery = ref('')
const searchResults = ref([])
const currentLocation = ref(null)
const isSearching = ref(false)
const provider = new OpenStreetMapProvider()
const showRouteMap = ref(true)

// Driver related state
const availableDrivers = ref([])
const selectedDriverId = ref(null)
const selectedRickshawType = ref('standard')
const showDriverLocations = ref(true)

// Form data
const startPoint = ref('')
const endPoint = ref('')
const startCoordinates = ref({ lat: null, lng: null })
const endCoordinates = ref({ lat: null, lng: null })

// Fetch available drivers
const fetchAvailableDrivers = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('status', 'available')
      .eq('rickshaw_type', selectedRickshawType.value)
    
    if (error) throw error
    
    availableDrivers.value = data || []
  } catch (error) {
    console.error('Error fetching drivers:', error)
    errorMessage.value = 'Failed to load available drivers'
  } finally {
    loading.value = false
  }
}

// Watch for rickshaw type changes
watch(selectedRickshawType, () => {
  fetchAvailableDrivers()
  selectedDriverId.value = null
})

onMounted(async () => {
  await fetchAvailableDrivers()
})

const handleMapClick = (event, isStart) => {
  const { lat, lng } = event.latlng
  if (isStart) {
    startCoordinates.value = { lat, lng }
    startPoint.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } else {
    endCoordinates.value = { lat, lng }
    endPoint.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

const handleMarkerDrag = (event, isStart) => {
  const { lat, lng } = event.target.getLatLng()
  if (isStart) {
    startCoordinates.value = { lat, lng }
    startPoint.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  } else {
    endCoordinates.value = { lat, lng }
    endPoint.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
  }
}

const searchLocation = async () => {
  if (!searchQuery.value) return
  
  try {
    isSearching.value = true
    const results = await provider.search({ query: searchQuery.value })
    searchResults.value = results
    
    if (results.length > 0) {
      const { y: lat, x: lng } = results[0]
      center.value = [lat, lng]
      zoom.value = 15
    }
  } catch (error) {
    console.error('Search error:', error)
    errorMessage.value = 'Failed to search location'
  } finally {
    isSearching.value = false
  }
}

const selectSearchResult = (result, isStart) => {
  const { y: lat, x: lng, label } = result
  if (isStart) {
    startCoordinates.value = { lat, lng }
    startPoint.value = label
  } else {
    endCoordinates.value = { lat, lng }
    endPoint.value = label
  }
  searchQuery.value = ''
  searchResults.value = []
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    errorMessage.value = 'Geolocation is not supported by your browser'
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      currentLocation.value = { lat: latitude, lng: longitude }
      center.value = [latitude, longitude]
      zoom.value = 15
    },
    (error) => {
      console.error('Geolocation error:', error)
      errorMessage.value = 'Failed to get current location'
    }
  )
}

const handleBooking = async () => {
  if (!startPoint.value || !endPoint.value || !selectedDriverId.value) {
    errorMessage.value = 'Please select pickup location, destination, and a driver'
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
          start_lat: startCoordinates.value.lat,
          start_lng: startCoordinates.value.lng,
          end_lat: endCoordinates.value.lat,
          end_lng: endCoordinates.value.lng,
          status: 'pending'
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
      .update({ status: 'on_trip' })
      .eq('id', selectedDriverId.value)
    
    if (driverError) throw driverError
    
    // Success
    bookingSuccess.value = true
    
    // Reset form
    startPoint.value = ''
    endPoint.value = ''
    startCoordinates.value = { lat: null, lng: null }
    endCoordinates.value = { lat: null, lng: null }
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
  startCoordinates.value = { lat: null, lng: null }
  endCoordinates.value = { lat: null, lng: null }
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

// Custom marker icon for drivers
const driverMarkerIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})
</script>

<template>
  <div>
    <div class="booking-card">
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold d-flex align-center text-white">
          <v-icon class="mr-2" color="#fdbb2d">mdi-car-3-plus</v-icon>
          Book an Auto Rickshaw
        </v-card-title>
        <v-card-subtitle class="text-subtitle-1 text-white opacity-80 mt-1">Safe & comfortable rides in Butuan City</v-card-subtitle>
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
            height="200"
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
          <v-row class="mt-4">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="startPoint"
                label="Pickup Location"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker"
                placeholder="Click to select location on map"
                :rules="[v => !!v || 'Pickup location is required']"
                bg-color="rgba(255, 255, 255, 0.1)"
                color="accent"
                class="rounded-lg input-field"
                readonly
                @click="showStartMap = true"
              ></v-text-field>
            </v-col>
            
            <v-col cols="12" md="6">
              <v-text-field
                v-model="endPoint"
                label="Destination"
                variant="outlined"
                prepend-inner-icon="mdi-map-marker-check"
                placeholder="Click to select location on map"
                :rules="[v => !!v || 'Destination is required']"
                bg-color="rgba(255, 255, 255, 0.1)"
                color="accent"
                class="rounded-lg input-field"
                readonly
                @click="showEndMap = true"
              ></v-text-field>
            </v-col>
          </v-row>

          <!-- Route Map -->
          <div class="route-map-container mt-4">
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
                  v-if="startCoordinates.lat"
                  :lat-lng="[startCoordinates.lat, startCoordinates.lng]"
                >
                  <l-popup>Pickup Location</l-popup>
                </l-marker>
                
                <l-marker
                  v-if="endCoordinates.lat"
                  :lat-lng="[endCoordinates.lat, endCoordinates.lng]"
                >
                  <l-popup>Destination</l-popup>
                </l-marker>
                
                <l-marker
                  v-if="currentLocation"
                  :lat-lng="[currentLocation.lat, currentLocation.lng]"
                  :icon="currentLocationIcon"
                >
                  <l-popup>Your Current Location</l-popup>
                </l-marker>
              </l-map>
            </div>
          </div>

          <!-- Rickshaw Type Selection -->
          <v-card-subtitle class="px-1 font-weight-bold text-uppercase text-white opacity-80 mt-6">
            Select Rickshaw Type
          </v-card-subtitle>
          
          <v-chip-group
            v-model="selectedRickshawType"
            selected-class="selected-type"
            mandatory
            class="mb-6 rickshaw-type-group"
          >
            <v-chip
              value="standard"
              filter
              variant="elevated"
              color="primary"
              size="large"
              class="pa-6 type-chip"
            >
              <v-icon start size="large" class="mr-2">mdi-car-3-plus</v-icon>
              Standard Auto
            </v-chip>
            <v-chip
              value="deluxe"
              filter
              variant="elevated"
              color="secondary"
              size="large"
              class="pa-6 type-chip"
            >
              <v-icon start size="large" class="mr-2">mdi-car-estate</v-icon>
              Deluxe Auto
            </v-chip>
          </v-chip-group>

          <!-- Available Drivers Map -->
          <div class="glass-container mb-6" v-if="showDriverLocations">
            <v-card-title class="text-h6 text-white d-flex align-center justify-space-between">
              <div>
                <v-icon color="#fdbb2d" class="mr-2">mdi-map-marker-multiple</v-icon>
                Available Drivers Location
              </div>
              <v-switch
                v-model="showDriverLocations"
                color="#fdbb2d"
                hide-details
                density="compact"
              ></v-switch>
            </v-card-title>
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
                  
                  <!-- Driver Markers -->
                  <l-marker
                    v-for="driver in availableDrivers"
                    :key="driver.id"
                    :lat-lng="[driver.current_lat, driver.current_lng]"
                    :icon="driverMarkerIcon"
                  >
                    <l-popup>
                      <div class="driver-popup">
                        <div class="text-subtitle-2 font-weight-bold">{{ driver.name }}</div>
                        <div class="text-caption">{{ driver.plate_number }}</div>
                        <div class="text-caption">{{ driver.address }}</div>
                        <v-btn
                          size="small"
                          color="primary"
                          class="mt-2"
                          @click="selectedDriverId = driver.id"
                        >
                          Select Driver
                        </v-btn>
                      </div>
                    </l-popup>
                  </l-marker>
                  
                  <!-- Start and End Markers -->
                  <l-marker
                    v-if="startCoordinates.lat"
                    :lat-lng="[startCoordinates.lat, startCoordinates.lng]"
                  >
                    <l-popup>Pickup Location</l-popup>
                  </l-marker>
                  
                  <l-marker
                    v-if="endCoordinates.lat"
                    :lat-lng="[endCoordinates.lat, endCoordinates.lng]"
                  >
                    <l-popup>Destination</l-popup>
                  </l-marker>
                </l-map>
              </div>
            </v-card-text>
          </div>

          <!-- Available Drivers List -->
          <v-card-subtitle class="px-1 font-weight-bold text-uppercase text-white opacity-80 mt-6">
            Available Drivers
          </v-card-subtitle>
          
          <div v-if="loading" class="d-flex justify-center my-8">
            <v-progress-circular indeterminate color="#fdbb2d" size="48" width="4"></v-progress-circular>
          </div>
          
          <div v-else-if="availableDrivers.length === 0" class="text-center my-8 pa-8 rounded-lg no-drivers-container">
            <v-icon size="48" color="rgba(255, 255, 255, 0.7)" class="mb-4">mdi-car-off</v-icon>
            <div class="text-body-1 text-white opacity-80">No {{ selectedRickshawType }} auto rickshaw drivers available at the moment.</div>
            <div class="text-caption text-white opacity-60 mt-2">Please try again later or select a different type</div>
          </div>
          
          <v-row v-else>
            <v-col
              v-for="driver in availableDrivers"
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
                  <v-avatar :color="driver.rickshaw_type === 'standard' ? 'primary' : 'secondary'" class="text-white mr-3" size="48">
                    <v-icon size="24">{{ driver.rickshaw_type === 'standard' ? 'mdi-car-3-plus' : 'mdi-car-estate' }}</v-icon>
                  </v-avatar>
                  <div>
                    <div class="text-h6 text-white font-weight-medium">{{ driver.name }}</div>
                    <div class="text-subtitle-2 text-white opacity-70">{{ driver.plate_number }}</div>
                  </div>
                </div>
                
                <v-card-text class="pt-0">
                  <div class="d-flex align-center flex-wrap gap-2">
                    <v-chip
                      size="small"
                      :color="driver.rickshaw_type === 'standard' ? 'primary' : 'secondary'"
                      class="text-white"
                      variant="flat"
                    >
                      {{ driver.rickshaw_type === 'standard' ? 'Standard' : 'Deluxe' }}
                    </v-chip>
                  </div>
                  
                  <div class="d-flex align-center mt-3">
                    <v-icon size="small" color="#fdbb2d" class="mr-2">mdi-map-marker</v-icon>
                    <span class="text-body-2 text-white opacity-80">{{ driver.address }}</span>
                  </div>
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

          <!-- Map Dialogs -->
          <v-dialog v-model="showStartMap" max-width="800">
            <v-card class="map-dialog">
              <v-card-title class="text-h6">Select Pickup Location in Butuan City</v-card-title>
              <v-card-text>
                <div class="map-controls mb-4">
                  <v-text-field
                    v-model="searchQuery"
                    placeholder="Search location in Butuan City..."
                    prepend-inner-icon="mdi-magnify"
                    @keyup.enter="searchLocation"
                    class="search-field"
                    hide-details
                    density="compact"
                  >
                    <template v-slot:append>
                      <v-btn
                        icon="mdi-crosshairs-gps"
                        variant="text"
                        @click="getCurrentLocation"
                        :loading="isSearching"
                      ></v-btn>
                    </template>
                  </v-text-field>
                  
                  <v-list v-if="searchResults.length > 0" class="search-results">
                    <v-list-item
                      v-for="result in searchResults"
                      :key="result.raw.place_id"
                      @click="selectSearchResult(result, true)"
                    >
                      <v-list-item-title>{{ result.label }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </div>
                
                <div class="map-container">
                  <l-map
                    v-model="map"
                    :zoom="zoom"
                    :center="center"
                    @click="(e) => handleMapClick(e, true)"
                  >
                    <l-tile-layer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      layer-type="base"
                      name="OpenStreetMap"
                    ></l-tile-layer>
                    
                    <l-marker
                      v-if="startCoordinates.lat"
                      :lat-lng="[startCoordinates.lat, startCoordinates.lng]"
                      :draggable="true"
                      @dragend="(e) => handleMarkerDrag(e, true)"
                    >
                      <l-popup>Pickup Location</l-popup>
                    </l-marker>
                    
                    <l-marker
                      v-if="currentLocation"
                      :lat-lng="[currentLocation.lat, currentLocation.lng]"
                      :icon="currentLocationIcon"
                    >
                      <l-popup>Your Current Location</l-popup>
                    </l-marker>
                  </l-map>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showStartMap = false">Confirm Location</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>

          <v-dialog v-model="showEndMap" max-width="800">
            <v-card class="map-dialog">
              <v-card-title class="text-h6">Select Destination in Butuan City</v-card-title>
              <v-card-text>
                <div class="map-controls mb-4">
                  <v-text-field
                    v-model="searchQuery"
                    placeholder="Search location in Butuan City..."
                    prepend-inner-icon="mdi-magnify"
                    @keyup.enter="searchLocation"
                    class="search-field"
                    hide-details
                    density="compact"
                  >
                    <template v-slot:append>
                      <v-btn
                        icon="mdi-crosshairs-gps"
                        variant="text"
                        @click="getCurrentLocation"
                        :loading="isSearching"
                      ></v-btn>
                    </template>
                  </v-text-field>
                  
                  <v-list v-if="searchResults.length > 0" class="search-results">
                    <v-list-item
                      v-for="result in searchResults"
                      :key="result.raw.place_id"
                      @click="selectSearchResult(result, false)"
                    >
                      <v-list-item-title>{{ result.label }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </div>
                
                <div class="map-container">
                  <l-map
                    v-model="map"
                    :zoom="zoom"
                    :center="center"
                    @click="(e) => handleMapClick(e, false)"
                  >
                    <l-tile-layer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      layer-type="base"
                      name="OpenStreetMap"
                    ></l-tile-layer>
                    
                    <l-marker
                      v-if="endCoordinates.lat"
                      :lat-lng="[endCoordinates.lat, endCoordinates.lng]"
                      :draggable="true"
                      @dragend="(e) => handleMarkerDrag(e, false)"
                    >
                      <l-popup>Destination</l-popup>
                    </l-marker>
                    
                    <l-marker
                      v-if="currentLocation"
                      :lat-lng="[currentLocation.lat, currentLocation.lng]"
                      :icon="currentLocationIcon"
                    >
                      <l-popup>Your Current Location</l-popup>
                    </l-marker>
                  </l-map>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="showEndMap = false">Confirm Location</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
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

.route-map-container {
  background: rgba(0, 0, 0, 0.5);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.map-container {
  height: 300px;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.map-dialog {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
}

.map-dialog :deep(.v-card-title) {
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.map-dialog :deep(.v-card-text) {
  padding: 0;
}

.map-dialog :deep(.v-card-actions) {
  padding: 16px;
}

/* Leaflet specific styles */
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

.map-controls {
  position: relative;
  z-index: 1000;
}

.search-field {
  background: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  backdrop-filter: blur(10px);
}

.search-field :deep(.v-field__input) {
  color: white !important;
  padding-top: 8px !important;
  padding-bottom: 8px !important;
}

.search-field :deep(.v-field__outline) {
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
}

.search-results :deep(.v-list-item) {
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

.search-results :deep(.v-list-item:hover) {
  background: rgba(255, 255, 255, 0.1);
}

.driver-popup {
  padding: 8px;
  min-width: 200px;
}

.driver-popup .text-subtitle-2 {
  color: #1a2a6c;
  margin-bottom: 4px;
}

.driver-popup .text-caption {
  color: #666;
  margin-bottom: 2px;
}
</style>