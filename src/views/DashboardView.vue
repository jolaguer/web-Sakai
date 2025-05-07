<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'
import Dashboard from '@/components/Dashboard.vue'
import AppLayout from '@/components/layout/AppLayout.vue'

const router = useRouter()
const user = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/')
      return
    }
    
    user.value = authUser
  } catch (error) {
    console.error('Error checking authentication:', error)
    router.push('/')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <div v-if="loading" class="d-flex justify-center align-center" style="height: 100vh">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </div>
    
    <Dashboard v-else-if="user" :user="user" />
  </div>
</template>