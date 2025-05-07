<script setup>
import { ref } from 'vue'

const currentYear = new Date().getFullYear()
</script>

<template>
  <v-responsive class="border rounded">
    <v-app :theme="theme">

      <v-main>
        <slot name="content"></slot>
      </v-main>

      <!-- Footer with gradient matching login page -->
      <v-footer class="footer-gradient">
        <v-container>
          <div class="d-flex flex-column align-center py-4">
            <div class="text-center mb-3">
              <h3 class="text-h6 font-weight-bold mb-1 text-white">BajajExpress</h3>
              <p class="text-caption text-white">Your trusted vehicle booking partner</p>
            </div>
            
            <!-- Quick links -->
            <div class="d-flex justify-center flex-wrap mb-3">
              <v-btn 
                v-for="(link, i) in ['Vehicles', 'Booking', 'Services', 'Contact']" 
                :key="i"
                variant="text" 
                size="small"
                color="accent"
                class="mx-1 footer-btn"
              >
                {{ link }}
              </v-btn>
            </div>
            
            <!-- Social icons -->
            <div class="d-flex justify-center mb-4">
              <v-btn
                v-for="(icon, i) in ['mdi-facebook', 'mdi-twitter', 'mdi-instagram', 'mdi-linkedin']"
                :key="i"
                icon
                variant="text"
                color="accent"
                size="small"
                class="mx-1 footer-icon-btn"
              >
                <v-icon>{{ icon }}</v-icon>
              </v-btn>
            </div>
            
            <!-- Copyright -->
            <div class="text-center text-caption text-white">
              © {{ currentYear }} BajajExpress Vehicle Booking. All rights reserved.
            </div>
            
            <!-- Legal links -->
            <div class="d-flex justify-center mt-2">
              <v-btn
                v-for="(text, i) in ['Privacy Policy', 'Terms of Service', 'Booking Policy']"
                :key="i"
                variant="text"
                density="compact"
                size="x-small"
                color="accent"
                class="mx-1 footer-legal-btn"
              >
                {{ text }}
              </v-btn>
            </div>
          </div>
        </v-container>
      </v-footer>

    </v-app>
  </v-responsive>
</template>

<style scoped>
.footer-gradient {
  background: #1a2a6c;
  color: #ffffff;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.footer-btn {
  color: rgba(255, 255, 255, 0.9) !important;
}

.footer-icon-btn {
  color: rgba(255, 255, 255, 0.9) !important;
}

.footer-legal-btn {
  color: rgba(255, 255, 255, 0.7) !important;
}

.footer-btn:hover,
.footer-icon-btn:hover,
.footer-legal-btn:hover {
  color: #fdbb2d !important;
  text-shadow: 0 0 5px rgba(253, 187, 45, 0.7);
}
</style>