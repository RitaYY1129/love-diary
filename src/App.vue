<template>
  <router-view v-slot="{ Component }">
    <transition name="page-fade" mode="out-in">
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { initMockData } from '@/api/mock'

const authStore = useAuthStore()

onMounted(() => {
  initMockData()
  authStore.loadUser()
})
</script>
