<script setup>
import { ref, onMounted, provide } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'

const router = useRouter()
const user = ref(null)
const loading = ref(true)

// Provide supabase client to all components
provide('supabase', supabase)

onMounted(async () => {
  // Check for existing session
  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user || null
  loading.value = false
  
  // Set up auth state listener
  supabase.auth.onAuthStateChange((_, session) => {
    user.value = session?.user || null
    if (!session?.user) {
      if (router.currentRoute.value.path.includes('/dashboard')) {
        router.push('/')
      }
    }
  })
})
</script>

<template>
  <RouterView />
</template>