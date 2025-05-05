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
  firstname: '', // Fixed typo from 'firsname'
  lastname: '',
  email: '',
  password: '',
  password_confirmation: '',
}

const formData = ref({
  ...formDataDefault,
})

const formAction = ref({
  ...formActionDefault
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
    if (valid) onSubmit() // Fixed typo from 'Valid'
  })
}
</script>

<template>

  <AlertNotification 
  :form-success-message="formAction.formSuccessMessage" 
  :form-error-message="formAction.formErrorMessage"
  ></AlertNotification>

  <v-form class="mt-5" ref="refVform" @submit.prevent="onFormSubmit">
    <v-row>
    <v-col cols="12" md="12">
      <v-text-field
        v-model="formData.firstname"
        label="Firstname"
        :rules="[requiredValidator]"
      ></v-text-field>
    </v-col>

    <v-col cols="12" md="12">
      <v-text-field
        v-model="formData.lastname"
        label="Lastname"
        :rules="[requiredValidator]"
      ></v-text-field>
    </v-col>

    <v-col cols="12" md="12">
      <v-text-field
        v-model="formData.email"
        type="email"
        label="Email"
        prepend-inner-icon="mdi-email-outline"
        :rules="[requiredValidator]"
      ></v-text-field>
    </v-col>

    <v-col cols="12" md="12">
      <v-text-field
        v-model="formData.password"
        prepend-inner-icon="mdi-lock-outline"
        label="Password"
        :type="isPasswordVisible ? 'text' : 'password'"
        :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="isPasswordVisible = !isPasswordVisible"
        :rules="[requiredValidator, passwordValidator]"
      ></v-text-field>
    </v-col>

    <v-col cols="12" md="12">
      <v-text-field
        v-model="formData.password_confirmation"
        prepend-inner-icon="mdi-lock-outline"
        label="Password Confirmation"
        :type="isPasswordConfirmation ? 'text' : 'password'"
        :append-inner-icon="isPasswordConfirmation ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="isPasswordConfirmation = !isPasswordConfirmation"
        :rules="[
          requiredValidator,
          confirmValidator(formData.password_confirmation, formData.password),
        ]"
      ></v-text-field>
    </v-col>
    <v-btn 
      class="mt-2" 
      type="submit" 
      prepend-icon="mdi-account-plus" 
      block 
      color="#EC407A"
      :loading="loading"
      :disabled="loading"
    >
      Register
    </v-btn>
  </v-form>
</template>

