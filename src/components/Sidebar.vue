<template>
  <aside class="w-64 bg-white h-screen py-4 px-3">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800">Dashboard</h1>
    </div>

    <nav>
      <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-primary text-white">
        <Home class="h-4 w-4 mr-3" />
        Dashboard
      </a>

      <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
        <Clock class="h-4 w-4 mr-3 text-gray-500" />
        Book a Ride
      </a>

      <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
        <Users class="h-4 w-4 mr-3 text-gray-500" />
        Drivers
      </a>

      <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
        <Calendar class="h-4 w-4 mr-3 text-gray-500" />
        Trip History
      </a>

      <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
        <Settings class="h-4 w-4 mr-3 text-gray-500" />
        Settings
      </a>
    </nav>

    <div class="mt-8">
      <a href="#" class="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100">
        <LogOut class="h-4 w-4 mr-3 text-gray-500" />
        Logout
      </a>
    </div>
  </aside>
</template>

<script>
import { ref, inject } from 'vue'
import { Home, Clock, Users, Calendar, Settings, LogOut } from 'lucide-vue-next'

export default {
  setup() {
    const appName = inject('appName')
    return {
      appName
    }
  }
}
</script>