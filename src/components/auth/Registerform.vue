<script setup>
import {
  requiredValidator,
  emailValidator,
  passwordValidator,
  confirmValidator,
} from '@/utils/validators'
import { ref } from 'vue'

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

const isPasswordVisible = ref(false)
const isPasswordConfirmation = ref(false)
const refVform = ref()

const onSubmit = () => {
  alert(formData.value.email)
}
const onFormSubmit = () => {
  refVform.value.validate().then(({ valid }) => {
    if (Valid) onSubmit()
  })
}
</script>

<template>
  <v-form ref="refVform" @submit.prevent="onFormSubmit">
    <v-col cols="12" md="12">
      <v-text-field
        v-model="formData.firsname"
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
      >Register</v-btn
    >
  </v-form>
</template>
