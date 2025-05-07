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
    if (valid) onSubmit()
  })
}

const forgotPassword = () => {
  // Handle forgot password functionality
  console.log('Forgot password clicked')
}
</script>

<template>
  <div class="login-card">
    <div class="login-header">
      <h1 class="text-h4 font-weight-bold text-center mb-6">Welcome Back</h1>
      <p class="text-subtitle-1 text-medium-emphasis text-center mb-8">Sign in to your account to continue</p>
    </div>

    <v-form ref="refVform" fast-fail @submit.prevent="onFormSubmit" class="login-form">
      <v-slide-y-transition>
        <v-alert
          v-if="errorMessage"
          density="compact"
          variant="tonal"
          type="error"
          class="mb-6"
          border="start"
          icon="mdi-alert-circle"
        >
          {{ errorMessage }}
        </v-alert>
      </v-slide-y-transition>
      
      <v-text-field
        v-model="formData.email"
        label="Email"
        placeholder="your.email@example.com"
        prepend-inner-icon="mdi-email-outline"
        :rules="[requiredValidator, emailValidator]"
        variant="outlined"
        color="accent"
        bg-color="rgba(255, 255, 255, 0.1)"
        class="mb-4 input-field"
      ></v-text-field>

      <v-text-field
        v-model="formData.password"
        prepend-inner-icon="mdi-lock-outline"
        label="Password"
        placeholder="Enter your password"
        :type="isPasswordVisible ? 'text' : 'password'"
        :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="isPasswordVisible = !isPasswordVisible"
        :rules="[requiredValidator]"
        variant="outlined"
        color="accent"
        bg-color="rgba(255, 255, 255, 0.1)"
        class="mb-2 input-field"
      ></v-text-field>

      <div class="d-flex justify-end mb-6">
        <v-btn
          variant="text"
          color="accent"
          density="comfortable"
          class="text-caption forgot-password-btn"
          @click="forgotPassword"
        >
          Forgot Password?
        </v-btn>
      </div>

      <v-btn 
        class="mb-6 signin-btn" 
        type="submit" 
        block 
        size="large"
        :loading="loading"
        :disabled="loading"
        elevation="2"
      >
        <span class="font-weight-medium">Sign In</span>
      </v-btn>

      <div class="text-center text-body-2">
        <span class="text-medium-emphasis">Don't have an account?</span>
        <v-btn
          variant="text"
          color="accent"
          class="ml-2 text-body-2 signup-btn"
          density="comfortable"
          to="/register"
        >
          Sign Up
        </v-btn>
      </div>
    </v-form>
  </div>
</template>

<style scoped>
.login-card {
  width: 100%;
  max-width: 450px;
  padding: 40px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.login-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(26, 42, 108, 0.3), rgba(178, 31, 31, 0.2), rgba(253, 187, 45, 0.3));
  z-index: -1;
  border-radius: 16px;
}

.login-header {
  margin-bottom: 32px;
}

.login-header h1 {
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.login-header p {
  color: rgba(255, 255, 255, 0.8);
}

.login-form {
  width: 100%;
}

.input-field :deep(.v-field__outline) {
  color: rgba(255, 255, 255, 0.3) !important;
}

.input-field :deep(.v-field__input) {
  color: #ffffff !important;
}

.input-field :deep(.v-field__field) {
  color: #ffffff !important;
}

.input-field :deep(.v-label) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.input-field :deep(.v-icon) {
  color: rgba(255, 255, 255, 0.7) !important;
}

.forgot-password-btn {
  color: #fdbb2d !important;
  transition: all 0.3s ease;
}

.forgot-password-btn:hover {
  color: #ffffff !important;
  text-shadow: 0 0 5px rgba(253, 187, 45, 0.7);
}

.signin-btn {
  background: linear-gradient(90deg, #1a2a6c, #b21f1f, #fdbb2d) !important;
  background-size: 200% auto !important;
  transition: all 0.5s ease !important;
  border: none !important;
  color: white !important;
  font-weight: 600 !important;
  letter-spacing: 1px !important;
  height: 48px !important;
  border-radius: 8px !important;
}

.signin-btn:hover {
  background-position: right center !important;
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3) !important;
  transform: translateY(-2px) !important;
}

.signup-btn {
  color: #fdbb2d !important;
  font-weight: 500 !important;
  transition: all 0.3s ease;
}

.signup-btn:hover {
  color: #ffffff !important;
  text-shadow: 0 0 5px rgba(253, 187, 45, 0.7);
}

.divider-container {
  position: relative;
}

.divider-container::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  z-index: 0;
}

.social-btn {
  flex: 1;
  text-transform: none;
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  transition: all 0.3s ease !important;
}

.social-btn:hover {
  background: rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px) !important;
}
</style>