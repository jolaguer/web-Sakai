<script setup>
import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  confirmValidator,
} from '@/utils/validators'
import { ref } from 'vue'
import { supabase, formActionDefault } from '@/utils/supabase.js'

const formDataDefault = {
  firsname: '',
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

const onSubmit = async () => {
  formAction.value = { ...formActionDefault}
  formAction.value.formProcess = true


  const { data, error } = await supabase.auth.signUp(
  {
    email: formData.value.email,
    password: formData.value.password,
    options: {
      data: {
        first_name: formData.value.firstname,
        last_name: formData.value.lastname
      }
    }
  }
)
if(error) {
  console.log(error)
  formAction.value.formErrorMessage = error.message
  formAction.value.formStatus = error.status
  
} else if(data) {
  console.log(data)
  formAction.value.formSuccessMessage = 'Successfully Registered Account'
  //add more actions here if you want
  refVform.value?.reset()
}

formAction.value.formProcess = false
}
const onFormSubmit = () => {
  refVform.value?.validate().then(({ valid }) => {
    if (valid) onSubmit()
  })
}
</script>

<template>
  <v-alert
  v-if="formAction.formSuccessMessage"
  :text="formAction.formSuccessMessage"
  title="Success!"
  type="success"
  variant="tonal"
  density="compact"
  border="start"
  closable
  ></v-alert>

  <v-alert
  v-if="formAction.formErrorMessage"
  :text="formAction.formErrorMessage"
  title="Oooops!!"
  type="error"
  variant="tonal"
  density="compact"
  border="start"
  closable
  ></v-alert>

  <v-form ref="refVform" @submit.prevent="onFormSubmit">
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
        :rules="[requiredValidator, emailValidator]"
      ></v-text-field>
    </v-col>

    <v-col cols="12" md="12">
      <v-text-field
        v-model="formData.password"
        prepend-inner-icon="mdi-lock-outline"
        label="Password"
        :type="isPasswordVisible ? 'text' : 'Password'"
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
        :type="isPasswordVisible ? 'text' : 'Password'"
        :append-inner-icon="isPasswordConfirmation ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="isPasswordConfirmation = !isPasswordConfirmation"
        :rules="[
          requiredValidator,
          confirmValidator(formData.password_confirmation, formData.password),
        ]"
      ></v-text-field>
    </v-col>

    <v-btn class="mt-2" type="submit" prepend-icon="mdi-account-plus" block color="#EC407A"
    :disabled="formAction.formProcess"
    :loading="formAction.formProcess"  
    
    >Register</v-btn
    >
  </v-row>
  </v-form>
</template>
