<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-row>
        <v-col cold="12" md="6" class="mx-auto pt-16">
          <v-card class="mx-auto" elevation="24">
            <v-img src="/images/jeje.jpg" height="200"></v-img>

            <v-card-title class="text-center">
              <h3 class="font-weight-black text-center">Sakai</h3>
              <p>Login Form</p>
            </v-card-title>

            <v-card-text class="bg-surface-light pt-4">
              <v-divider class="my-5"></v-divider>
              <v-form fast-fail @submit.prevent>
                <v-text-field label="Email" variant="outlined"></v-text-field>

                <v-text-field label="Password" type="password" variant="outlined"></v-text-field>

                <v-btn class="mt-2" type="submit" prepend-icon="mdi-login" block color="#EC407A"
                  >Login</v-btn
                >
              </v-form>
              <v-divider class="my-5"></v-divider>
              <h5 class="text-center">
                Don't have account?
                <RouterLink class="text-primary" to="/register">Click here to register</RouterLink>
              </h5>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>
