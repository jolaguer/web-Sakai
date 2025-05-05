<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import {useRouter} from 'vue-router'


const router = useRouter()
const user = ref(null)
const loading = ref(true)
const errorMessage = ref('')

onMounted(async () => {
  try {
    loading.value = true
    
    // Get the current session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) throw error
    
    if (session) {
      user.value = session.user
    }
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
})

const handleSignOut = async () => {
  try {
    loading.value = true
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null

    router.push("/")
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <v-alert v-if="errorMessage" type="error" class="mb-4">
      {{ errorMessage }}
    </v-alert>
    
    <v-card v-if="user" class="pa-4">
      <v-card-title>User Profile</v-card-title>
      <v-card-text>
        <p><strong>Email:</strong> {{ user.email }}</p>
        <p><strong>User ID:</strong> {{ user.id }}</p>
        <p v-if="user.user_metadata?.first_name">
          <strong>First Name:</strong> {{ user.user_metadata.first_name }}
        </p>
        <p v-if="user.user_metadata?.last_name">
          <strong>Last Name:</strong> {{ user.user_metadata.last_name }}
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn color="error" @click="handleSignOut" :loading="loading">
          Sign Out
        </v-btn>
      </v-card-actions>
    </v-card>
    
    <v-progress-circular v-if="loading" indeterminate color="#EC407A"></v-progress-circular>
  </div>
</template>