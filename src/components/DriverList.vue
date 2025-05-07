<script setup>
import { ref, inject, onMounted, computed } from 'vue'
import { supabase } from '@/supabase'

const loading = ref(true)
const drivers = ref([])
const errorMessage = ref('')
const searchQuery = ref('')
const statusFilter = ref('all')
const rickshawTypeFilter = ref('all')

// Auto Rickshaw type options for filtering
const rickshawTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'standard', label: 'Standard' },
  { value: 'deluxe', label: 'Deluxe' }
]

// Status options for filtering - Fixed the value for "on-trip" to match database
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'on_trip', label: 'On Trip' },  // Changed from 'on-trip' to 'on_trip'
  { value: 'inactive', label: 'Inactive' }
]

// Status badge colors - Updated to match the correct database value
const getStatusColor = (status) => {
  switch (status) {
    case 'available': return 'success'
    case 'on_trip': return 'info'     // Changed from 'on-trip' to 'on_trip'
    case 'inactive': return 'grey'
    default: return 'grey'
  }
}

const filteredDrivers = computed(() => {
  return drivers.value.filter(driver => {
    // Filter by search query
    const matchesSearch = driver.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                          driver.plate_number.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    // Filter by status
    const matchesStatus = statusFilter.value === 'all' || driver.status === statusFilter.value
    
    // Filter by rickshaw type
    const matchesRickshawType = rickshawTypeFilter.value === 'all' || driver.rickshaw_type === rickshawTypeFilter.value
    
    return matchesSearch && matchesStatus && matchesRickshawType
  })
})

onMounted(async () => {
  await fetchDrivers()
})

const fetchDrivers = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
    
    if (error) throw error
    
    drivers.value = data || []
  } catch (error) {
    console.error('Error fetching drivers:', error)
    errorMessage.value = 'Failed to load drivers'
  } finally {
    loading.value = false
  }
}

// Helper function to determine rickshaw type color based on driver index
const getRickshawColor = (index) => {
  // Use gradient colors matching the booking theme
  return index % 2 === 0 ? 'rgba(26, 42, 108, 0.8)' : 'rgba(178, 31, 31, 0.8)'
}

// Helper function to determine rickshaw type name based on driver index
const getRickshawType = (type) => {
  return type === 'standard' ? 'Standard' : 'Deluxe'
}

// Rating placeholder (since we don't have actual ratings in the data)
const getRandomRating = () => {
  return (4 + Math.random()).toFixed(1)
}
</script>

<template>
  <div>
    <div class="drivers-card">
      <v-card-item>
        <v-card-title class="text-h5 font-weight-bold d-flex align-center text-white">
          <v-icon class="mr-2" color="#fdbb2d">mdi-car-3-plus</v-icon>
          Auto Rickshaw Drivers
        </v-card-title>
        <v-card-subtitle class="text-subtitle-1 text-white opacity-80 mt-1">Browse our fleet of professional drivers</v-card-subtitle>
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
            height="200"
            class="rounded-lg"
            cover
            gradient="to bottom, rgba(26, 42, 108, 0.3), rgba(178, 31, 31, 0.3), rgba(253, 187, 45, 0.3)"
            alt="Auto Rickshaws"
          >
            <div class="fill-height d-flex align-end">
              <div class="pa-6 text-white">
                <div class="text-h6 font-weight-bold">Meet Our Drivers</div>
                <div class="text-subtitle-2">Skilled professionals ready to serve you</div>
              </div>
            </div>
          </v-img>
        </div>
        
        <v-row class="mb-6">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Search drivers"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              placeholder="Search by name or plate number"
              bg-color="rgba(255, 255, 255, 0.1)"
              color="accent"
              class="rounded-lg input-field"
              hide-details
            ></v-text-field>
          </v-col>
          
          <v-col cols="6" md="3">
            <v-select
              v-model="rickshawTypeFilter"
              :items="rickshawTypes"
              item-title="label"
              item-value="value"
              label="Rickshaw Type"
              variant="outlined"
              bg-color="rgba(255, 255, 255, 0.1)"
              color="accent"
              class="rounded-lg input-field"
              hide-details
            ></v-select>
          </v-col>
          
          <v-col cols="6" md="3">
            <v-select
              v-model="statusFilter"
              :items="statusOptions"
              item-title="label"
              item-value="value"
              label="Status"
              variant="outlined"
              bg-color="rgba(255, 255, 255, 0.1)"
              color="accent"
              class="rounded-lg input-field"
              hide-details
            ></v-select>
          </v-col>
        </v-row>
        
        <div v-if="loading" class="d-flex justify-center my-8">
          <v-progress-circular indeterminate color="#fdbb2d" size="48" width="4"></v-progress-circular>
        </div>
        
        <div v-else-if="filteredDrivers.length === 0" class="text-center my-8 pa-8 rounded-lg no-drivers-container">
          <v-icon size="48" color="rgba(255, 255, 255, 0.7)" class="mb-4">mdi-car-off</v-icon>
          <div class="text-body-1 text-white opacity-80">No drivers found matching your filters</div>
          <div class="text-caption text-white opacity-60 mt-2">Try adjusting your search criteria</div>
        </div>
        
        <v-row v-else>
          <v-col
            v-for="(driver, index) in filteredDrivers"
            :key="driver.id"
            cols="12"
            sm="6"
            md="4"
          >
            <div class="driver-card">
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
                    :model-value="parseFloat(getRandomRating())"
                    color="#fdbb2d"
                    size="small"
                    half-increments
                    density="compact"
                  ></v-rating>
                  <span class="ml-1 text-caption text-white opacity-80">{{ getRandomRating() }}</span>
                </div>
              </v-card-text>
              
              <v-card-text class="pt-0">
                <div class="d-flex align-center flex-wrap gap-2">
                  <v-chip
                    size="small"
                    :color="getStatusColor(driver.status)"
                    variant="flat"
                    prepend-icon="mdi-circle-small"
                    class="text-capitalize"
                  >
                    {{ driver.status.replace('_', ' ') }}
                  </v-chip>
                  
                  <v-chip
                    size="small"
                    :color="getRickshawColor(index)"
                    class="ml-2 text-white"
                    variant="flat"
                  >
                    {{ getRickshawType(driver.rickshaw_type) }}
                  </v-chip>
                </div>
                
                <div class="d-flex align-center mt-3">
                  <v-icon size="small" color="#fdbb2d" class="mr-2">mdi-phone</v-icon>
                  <span class="text-body-2 text-white opacity-80">{{ driver.phone }}</span>
                </div>
              </v-card-text>
              
              <v-divider class="opacity-20"></v-divider>
              
            </div>
          </v-col>
        </v-row>
        
        <!-- Alternative table view for larger screens -->
        <div class="glass-container mt-6 d-none d-lg-block">
          <v-data-table
            :headers="[
              { title: 'Driver', key: 'name', align: 'start' },
              { title: 'Auto Type', key: 'rickshaw_type', align: 'start' },
              { title: 'Plate Number', key: 'plate_number', align: 'start' },
              { title: 'Status', key: 'status', align: 'start' },
              { title: 'Phone', key: 'phone', align: 'start' }
            ]"
            :items="filteredDrivers"
            :loading="loading"
            class="rounded-lg dark-table"
          >
            <template v-slot:item.name="{ item, index }">
              <div class="d-flex align-center">
                <v-avatar size="36" :color="getRickshawColor(index)" class="text-white mr-3">
                  <v-icon>mdi-account</v-icon>
                </v-avatar>
                <span class="font-weight-medium text-white">{{ item.name }}</span>
              </div>
            </template>
            
            <template v-slot:item.rickshaw_type="{ item, index }">
              <div class="d-flex align-center">
                <v-avatar :color="getRickshawColor(index)" class="text-white mr-2" size="24">
                  <v-icon size="small">mdi-car-3-plus</v-icon>
                </v-avatar>
                <span class="text-capitalize text-white">{{ getRickshawType(item.rickshaw_type) }}</span>
              </div>
            </template>
            
            <template v-slot:item.status="{ item }">
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                variant="flat"
                class="text-capitalize"
              >
                {{ item.status.replace('_', ' ') }}
              </v-chip>
            </template>
            
            <template v-slot:item.plate_number="{ item }">
              <span class="text-white opacity-80">{{ item.plate_number }}</span>
            </template>
            
            <template v-slot:item.phone="{ item }">
              <span class="text-white opacity-80">{{ item.phone }}</span>
            </template>
          </v-data-table>
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

.drivers-card {
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

.drivers-card::before {
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

/* Dark table styling */
.dark-table {
  background: transparent !important;
}

.dark-table :deep(.v-data-table__td) {
  color: white !important;
  background: rgba(0, 0, 0, 0.3) !important;
}

.dark-table :deep(.v-data-table__th) {
  color: #fdbb2d !important;
  background: rgba(0, 0, 0, 0.5) !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  letter-spacing: 1px !important;
  font-size: 0.8rem !important;
}

.dark-table :deep(.v-data-table-footer) {
  background: rgba(0, 0, 0, 0.5) !important;
  color: white !important;
}

.dark-table :deep(.v-data-table__wrapper) {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 16px !important;
}
</style>