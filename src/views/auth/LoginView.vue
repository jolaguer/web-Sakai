<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
</script>

<template>
  <AppLayout>
    <template #content>
      <v-container fluid>
        <v-row>
          <v-col cold="12" md="6" class="mx-auto pt-16">
            <v-card class="mx-auto" elevation="24">
              <v-img src="/images/jeje.jpg" height="200"></v-img>

              <v-card-title class="text-center">
                <h3 class="font-weight-black text-center">BajajXpress</h3>
                <p>Login Form</p>
              </v-card-title>

              <v-card-text class="bg-surface-light pt-4">
                <v-divider class="my-5"></v-divider>

                <LoginForm></LoginForm>

                <v-divider class="my-5"></v-divider>
                <h5 class="text-center">
                  Don't have account?
                  <RouterLink class="text-primary" to="/register"
                    >Click here to register</RouterLink
                  >
                </h5>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </template>
  </AppLayout>
</template>
