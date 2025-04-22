<script setup>
import { ref } from 'vue'

const isPasswordVisible = ref(false)
const isPasswordConfirmation = ref(false)
</script>

<template>
  <v-form fast-fail @submit.prevent>
    <v-col cols="12" md="12">
      <v-text-field label="Firstname"></v-text-field>
    </v-col>

    <v-col cols="12" md="12">
      <v-text-field label="Lastname"></v-text-field>
    </v-col>

    <v-col cols="12" md="12">
      <v-text-field label="Email" prepend-inner-icon="mdi-email-outline"></v-text-field>
    </v-col>

    <v-col cols="12" md="12">
      <v-text-field
        prepend-inner-icon="mdi-lock-outline"
        label="Password"
        :type="isPasswordVisible ? 'text' : 'Password'"
        :append-inner-icon="isPasswordVisible ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="isPasswordVisible = !isPasswordVisible"
      ></v-text-field>
    </v-col>

    <v-col cols="12" md="12">
      <v-text-field
        prepend-inner-icon="mdi-lock-outline"
        label="Password Confirmation"
        :type="isPasswordVisible ? 'text' : 'Password'"
        :append-inner-icon="isPasswordConfirmation ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="isPasswordConfirmation = !isPasswordConfirmation"
      ></v-text-field>
    </v-col>

    <v-btn class="mt-2" type="submit" prepend-icon="mdi-account-plus" block color="#EC407A"
      >Register</v-btn
    >
  </v-form>
</template>
