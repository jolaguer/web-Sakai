<script setup>
import { requiredValidator, emailValidator } from '@/utils/validators'
import { ref } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'


const router = useRouter()
const isPasswordVisible = ref(false)
const refVform = ref()
const loading = ref(false)
const errorMessage = ref('')

const formDataDefault = {
  email: '',
  password: '',
}

const formData = ref({
  ...formDataDefault,
})

const onSubmit = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.value.email,
      password: formData.value.password,
    })
    
    if (error) throw error
    
    // If successful, you might want to redirect or update UI
    alert('Login successful!')
    
    // You can access the user data with data.user
    console.log('User logged in:', data.user)
    router.push('/dashboard')
    // Reset form
    formData.value = { ...formDataDefault }
    
  } catch (error) {
    errorMessage.value = error.message || 'Invalid email or password'
  } finally {
    loading.value = false
  }
}

const onFormSubmit = () => {
  refVform.value.validate().then(({ valid }) => {
    if (valid) onSubmit() // Fixed typo from 'Valid'
  })
}
</script>

<template>
  <v-form ref="refVform" fast-fail @submit.prevent="onFormSubmit">
    <v-alert v-if="errorMessage" type="error" class="mb-4">
      {{ errorMessage }}
    </v-alert>
    
    <v-text-field
      v-model="formData.email"
      label="Email"
      prepend-inner-icon="mdi-email-outline"
      :rules="[requiredValidator]"
    ></v-text-field>

    <v-text-field
      v-model="formData.password"
      prepend-inner-icon="mdi-lock-outline"
      label="Password"
      :type="isPasswordVisible ? 'text' : 'password'"
      :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
      @click:append-inner="isPasswordVisible = !isPasswordVisible"
      :rules="[requiredValidator]"
    ></v-text-field>

    <v-btn 
      class="mt-2" 
      type="submit" 
      prepend-icon="mdi-login" 
      block 
      color="#EC407A"
      :loading="loading"
      :disabled="loading"
    >
      Login
    </v-btn>
  </v-form>
</template>