<template>
  <div class="page-container">
    <div class="page-header">
      <button @click="goBack" class="btn-back">←</button>
      <h1 class="text-xl font-bold">每日打卡</h1>
    </div>

    <div class="page-content">
      <div class="card text-center mb-4">
        <div class="text-6xl mb-4">{{ hasCheckedInToday ? '✅' : '🎉' }}</div>
        <h2 class="text-2xl font-bold mb-2">
          {{ hasCheckedInToday ? '今日已打卡' : '打卡奖励' }}
        </h2>
        <p class="text-gray-500 mb-4">
          {{ hasCheckedInToday ? '明天再来吧' : '坚持打卡，记录每一天' }}
        </p>
        <button 
          @click="doCheckin"
          :disabled="hasCheckedInToday"
          class="btn btn-primary"
        >
          {{ hasCheckedInToday ? '已打卡' : '立即打卡' }}
        </button>
      </div>

      <div class="card mb-4">
        <div class="flex justify-around text-center">
          <div>
            <div class="text-3xl font-bold text-primary">{{ streak }}</div>
            <div class="text-sm text-gray-500">连续天数</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-primary">{{ totalCheckins }}</div>
            <div class="text-sm text-gray-500">累计打卡</div>
          </div>
          <div>
            <div class="text-3xl font-bold text-primary">{{ perfectMonth }}</div>
            <div class="text-sm text-gray-500">完美月份</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="font-bold mb-4">本月打卡记录</h2>
        <div class="grid grid-cols-7 gap-1">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            class="text-center py-2"
          >
            <div class="text-xs text-gray-400 mb-1">{{ day.day }}</div>
            <div 
              class="w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm"
              :class="day.status"
            >
              {{ day.emoji }}
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="font-bold mb-4">成就徽章</h2>
        <div class="grid grid-cols-4 gap-4">
          <div 
            v-for="badge in badges" 
            :key="badge.id"
            :class="['text-center p-3 rounded-xl', badge.unlocked ? 'bg-primary/10' : 'bg-gray-100 opacity-50']"
          >
            <div class="text-2xl mb-1">{{ badge.icon }}</div>
            <div class="text-xs font-medium">{{ badge.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-bar">
      <div 
        v-for="tab in tabs" 
        :key="tab.path"
        @click="navigate(tab.path)"
        :class="['tab-item', currentPath === tab.path ? 'active' : '']"
      >
        <span class="icon">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </div>
    </div>

    <div :class="['toast', toast.show ? 'show' : '']">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCheckinStore } from '@/stores/checkin'

const router = useRouter()
const route = useRoute()
const checkinStore = useCheckinStore()

const currentPath = computed(() => route.path)

const tabs = [
  { path: '/home', icon: '🏠', label: '首页' },
  { path: '/anniversary', icon: '♡', label: '纪念日' },
  { path: '/chat', icon: '💬', label: '聊天' },
  { path: '/location', icon: '📍', label: '位置' },
  { path: '/me', icon: '👤', label: '我的' }
]

const streak = ref(0)
const totalCheckins = ref(0)
const perfectMonth = ref(0)
const checkinDates = ref([])

const toast = ref({
  show: false,
  message: ''
})

const showToast = (message) => {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, 2000)
}

const hasCheckedInToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return checkinDates.value.includes(today)
})

const badges = computed(() => [
  { id: 1, name: '初来乍到', icon: '🌱', unlocked: totalCheckins.value >= 1 },
  { id: 2, name: '坚持不懈', icon: '🔥', unlocked: streak.value >= 7 },
  { id: 3, name: '月度冠军', icon: '👑', unlocked: perfectMonth.value >= 1 },
  { id: 4, name: '百日达人', icon: '💯', unlocked: totalCheckins.value >= 100 }
])

const calendarDays = computed(() => {
  const days = []
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push({ day: '', status: '', emoji: '' })
  }
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
    const isChecked = checkinDates.value.includes(dateStr)
    const isToday = i === today.getDate()
    
    days.push({
      day: i,
      status: isChecked ? 'bg-primary text-white' : isToday ? 'bg-gray-200' : 'bg-gray-100',
      emoji: isChecked ? '✓' : ''
    })
  }
  
  return days
})

const goBack = () => {
  router.back()
}

const navigate = (path) => {
  if (path !== currentPath.value) {
    router.push(path)
  }
}

const doCheckin = async () => {
  if (hasCheckedInToday.value) return
  
  const result = await checkinStore.checkin()
  if (result.success) {
    showToast(`打卡成功！连续${result.streak}天`)
    await loadData()
  } else {
    showToast('打卡失败，请稍后重试')
  }
}

const loadData = async () => {
  await Promise.all([
    checkinStore.loadHistory(),
    checkinStore.loadStreak()
  ])
  
  checkinDates.value = checkinStore.history
  streak.value = checkinStore.streak
  totalCheckins.value = checkinStore.totalCheckins
}

onMounted(() => {
  loadData()
})
</script>
