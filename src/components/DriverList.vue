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
  { value: 'standard', label: 'Standard (Yellow)' },
  { value: 'deluxe', label: 'Deluxe (Red)' }
]

// Status options for filtering
const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'available', label: 'Available' },
  { value: 'on-trip', label: 'On Trip' },
  { value: 'inactive', label: 'Inactive' }
]

// Status badge colors
const getStatusColor = (status) => {
  switch (status) {
    case 'available': return 'success'
    case 'on-trip': return 'info'
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

const getRickshawColor = (type) => {
  return type === 'standard' ? 'amber-darken-1' : 'red-darken-1'
}
</script>

<template>
  <div>
    <v-card>
      <v-card-title class="text-h5 font-weight-bold d-flex align-center">
        <v-icon class="mr-2">mdi-car-3-plus</v-icon>
        Auto Rickshaw Drivers
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
        
        <div class="d-flex justify-center mb-6">
          <v-img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/download.jpg-pvUUUs3UPbD2GSn0jXsqMeEtME8k5S.jpeg"
            max-width="400"
            class="rounded-lg"
            alt="Auto Rickshaws"
          ></v-img>
        </div>
        
        <v-row>
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              label="Search drivers"
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              hide-details
              density="compact"
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
              hide-details
              density="compact"
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
              hide-details
              density="compact"
            ></v-select>
          </v-col>
        </v-row>
        
        <div v-if="loading" class="d-flex justify-center my-8">
          <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
        </div>
        
        <div v-else-if="filteredDrivers.length === 0" class="text-center my-8">
          <v-icon icon="mdi-alert-circle-outline" size="64" color="grey-lighten-1" class="mb-4"></v-icon>
          <div class="text-h6 text-medium-emphasis">No drivers found matching your filters</div>
        </div>
        
        <v-data-table
          v-else
          :headers="[
            { title: 'Driver', key: 'name', align: 'start' },
            { title: 'Auto Type', key: 'rickshaw_type', align: 'start' },
            { title: 'Plate Number', key: 'plate_number', align: 'start' },
            { title: 'Status', key: 'status', align: 'start' },
            { title: 'Phone', key: 'phone', align: 'start' }
          ]"
          :items="filteredDrivers"
          :loading="loading"
          class="mt-4"
        >
          <template v-slot:item.name="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="36" color="grey-lighten-3" class="mr-3">
                <v-icon>mdi-account</v-icon>
              </v-avatar>
              {{ item.name }}
            </div>
          </template>
          
          <template v-slot:item.rickshaw_type="{ item }">
            <div class="d-flex align-center">
              <v-avatar :color="getRickshawColor(item.rickshaw_type)" size="24" class="mr-2 text-white">
                <v-icon size="small">mdi-car-3-plus</v-icon>
              </v-avatar>
              <span class="text-capitalize">{{ item.rickshaw_type }} Auto</span>
            </div>
          </template>
          
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusColor(item.status)"
              size="small"
              class="text-capitalize"
            >
              {{ item.status.replace('-', ' ') }}
            </v-chip>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </div>
</template>