<script setup>
import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  confirmValidator,
} from '@/utils/validators'
import { ref } from 'vue'
import { supabase } from '@/supabase'
import { useRouter } from 'vue-router'


const router = useRouter()

const formDataDefault = {
  firstname: '',
  lastname: '',
  email: '',
  password: '',
  password_confirmation: '',
}

const formData = ref({
  ...formDataDefault,
})

const isPasswordVisible = ref(false)
const isPasswordConfirmation = ref(false)
const refVform = ref()
const loading = ref(false)
const errorMessage = ref('')

const onSubmit = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    
    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: formData.value.email,
      password: formData.value.password,
      options: {
        data: {
          first_name: formData.value.firstname,
          last_name: formData.value.lastname,
        }
      }
    })
    
    if (error) throw error
    
    // If successful, show success message or redirect
    alert('Registration successful! Please check your email for confirmation.')
    router.push('/dashboard')
    // Reset form
    formData.value = { ...formDataDefault }
    
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred during registration'
  } finally {
    loading.value = false
  }
}

const onFormSubmit = () => {
  refVform.value.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}
</script>

<template>
  <div class="register-card">
    <div class="register-header">
      <h1 class="text-h4 font-weight-bold text-center mb-6">Create Account</h1>
      <p class="text-subtitle-1 text-medium-emphasis text-center mb-8">Fill out the form to get started</p>
    </div>

    <v-form ref="refVform" fast-fail @submit.prevent="onFormSubmit" class="register-form">
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
        v-model="formData.firstname"
        label="First Name"
        placeholder="Enter your first name"
        prepend-inner-icon="mdi-account-outline"
        :rules="[requiredValidator]"
        variant="outlined"
        color="accent"
        bg-color="rgba(255, 255, 255, 0.1)"
        class="mb-4 input-field"
      ></v-text-field>

      <v-text-field
        v-model="formData.lastname"
        label="Last Name"
        placeholder="Enter your last name"
        prepend-inner-icon="mdi-account-outline"
        :rules="[requiredValidator]"
        variant="outlined"
        color="accent"
        bg-color="rgba(255, 255, 255, 0.1)"
        class="mb-4 input-field"
      ></v-text-field>

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
        placeholder="Create a password"
        :type="isPasswordVisible ? 'text' : 'password'"
        :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="isPasswordVisible = !isPasswordVisible"
        :rules="[requiredValidator, passwordValidator]"
        variant="outlined"
        color="accent"
        bg-color="rgba(255, 255, 255, 0.1)"
        class="mb-4 input-field"
      ></v-text-field>

      <v-text-field
        v-model="formData.password_confirmation"
        prepend-inner-icon="mdi-lock-outline"
        label="Confirm Password"
        placeholder="Repeat your password"
        :type="isPasswordConfirmation ? 'text' : 'password'"
        :append-inner-icon="isPasswordConfirmation ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="isPasswordConfirmation = !isPasswordConfirmation"
        :rules="[
          requiredValidator,
          confirmValidator(formData.password_confirmation, formData.password),
        ]"
        variant="outlined"
        color="accent"
        bg-color="rgba(255, 255, 255, 0.1)"
        class="mb-6 input-field"
      ></v-text-field>

      <v-btn 
        class="mb-6 signup-btn" 
        type="submit" 
        block 
        size="large"
        :loading="loading"
        :disabled="loading"
        elevation="2"
      >
        <span class="font-weight-medium">Create Account</span>
      </v-btn>

      <div class="text-center text-body-2">
        <span class="text-medium-emphasis">Already have an account?</span>
        <RouterLink to="/" class="login-link">
          <v-btn
            variant="text"
            color="accent"
            class="ml-2 text-body-2 signin-btn-text"
            density="comfortable"
          >
            Sign In
          </v-btn>
        </RouterLink>
      </div>
    </v-form>
  </div>
</template>

<style scoped>
.register-card {
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

.register-card::before {
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

.register-header {
  margin-bottom: 32px;
}

.register-header h1 {
  color: #ffffff;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.register-header p {
  color: rgba(255, 255, 255, 0.8);
}

.register-form {
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

.signup-btn {
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

.signup-btn:hover {
  background-position: right center !important;
  box-shadow: 0 7px 20px rgba(0, 0, 0, 0.3) !important;
  transform: translateY(-2px) !important;
}

.signin-btn-text {
  color: #fdbb2d !important;
  font-weight: 500 !important;
  transition: all 0.3s ease;
}

.signin-btn-text:hover {
  color: #ffffff !important;
  text-shadow: 0 0 5px rgba(253, 187, 45, 0.7);
}
</style>