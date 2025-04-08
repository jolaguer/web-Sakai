<script setup>
import AppLayout from '@/components/layout/AppLayout.vue'
import Registerform from '@/components/auth/Registerform.vue'
</script>

<template>
  <AppLayout>
    <template #content
      ><v-row>
        <v-col cold="12" md="6" class="mx-auto">
          <v-card class="mx-auto" elevation="24">
            <v-img src="/images/jeje.jpg" height="200"></v-img>
            <v-card-title class="text-center">
              <h3 class="font-weight-black text-center">BajajXpress</h3>
              <p>register</p>
            </v-card-title>

            <v-card-text class="bg-surface-light pt-4">
              <v-divider class="my-5"></v-divider>

              <Registerform></Registerform>

              <v-divider class="my-5"></v-divider>

              <h5 class="text-center">
                Already have account?
                <RouterLink class="text-primary" to="/">Click here to login</RouterLink>
              </h5>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </AppLayout>
</template>
