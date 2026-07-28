<template>
  <div class="page-container">
    <div class="page-header">
      <h1 class="text-xl font-bold">我的</h1>
    </div>

    <div class="page-content">
      <div class="card text-center mb-6">
        <div class="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <span class="text-3xl">👤</span>
        </div>
        <h2 class="text-xl font-bold">{{ user?.nickname || '用户' }}</h2>
        <p class="text-gray-500 text-sm mt-1">{{ user?.phone }}</p>
        <div class="flex justify-center gap-8 mt-4">
          <div>
            <div class="text-xl font-bold text-primary">{{ diaryCount }}</div>
            <div class="text-xs text-gray-500">日记</div>
          </div>
          <div>
            <div class="text-xl font-bold text-primary">{{ checkinDays }}</div>
            <div class="text-xs text-gray-500">打卡</div>
          </div>
          <div>
            <div class="text-xl font-bold text-primary">{{ photoCount }}</div>
            <div class="text-xs text-gray-500">照片</div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <div class="flex items-center gap-3">
            <span class="text-xl">💝</span>
            <span>绑定另一半</span>
          </div>
          <span class="text-gray-400">→</span>
        </div>
        <div class="flex items-center justify-between py-3">
          <div class="flex items-center gap-3">
            <span class="text-xl">🎁</span>
            <span>邀请码</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-primary font-mono">{{ inviteCode }}</span>
            <button @click="copyInviteCode" class="text-sm text-primary">复制</button>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div 
          v-for="item in menuItems" 
          :key="item.label"
          @click="handleMenuClick(item)"
          class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </div>
          <span class="text-gray-400">→</span>
        </div>
      </div>

      <button @click="handleLogout" class="btn btn-secondary btn-block">退出登录</button>
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
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const currentPath = computed(() => route.path)

const tabs = [
  { path: '/home', icon: '🏠', label: '首页' },
  { path: '/anniversary', icon: '♡', label: '纪念日' },
  { path: '/photo', icon: '📸', label: '足迹' },
  { path: '/location', icon: '📍', label: '位置' },
  { path: '/me', icon: '👤', label: '我的' }
]

const menuItems = [
  { icon: '📝', label: '恋爱日记', path: '/diary' },
  { icon: '📊', label: '数据统计', path: '/dashboard' },
  { icon: '😊', label: '心情记录', path: '/mood' },
  { icon: '✅', label: '打卡记录', path: '/checkin' },
  { icon: '⭐', label: '心愿清单', path: '/wishes' },
  { icon: '🎯', label: '愿望清单', path: '/bucketlist' },
  { icon: '🎂', label: '纪念日', path: '/anniversary' },
  { icon: '📋', label: '计划安排', path: '/plan' },
  { icon: '⏰', label: '提醒设置', path: '/alarm' },
  { icon: '🎮', label: '情侣游戏', path: '/games' },
  { icon: '🌳', label: '心情树洞', path: '/vent' },
  { icon: '⚙️', label: '设置', path: '/settings' }
]

const user = computed(() => authStore.user)
const diaryCount = ref(0)
const checkinDays = ref(0)
const photoCount = ref(0)
const inviteCode = ref('LOVE' + Math.random().toString(36).substr(2, 6).toUpperCase())

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

const navigate = (path) => {
  if (path !== currentPath.value) {
    router.push(path)
  }
}

const handleMenuClick = (item) => {
  if (item.path) {
    router.push(item.path)
  }
}

const copyInviteCode = () => {
  navigator.clipboard.writeText(inviteCode.value)
  showToast('邀请码已复制')
}

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    router.push('/')
  }
}

const loadStats = async () => {
  try {
    const diaries = JSON.parse(localStorage.getItem('loveDiary_diaries') || '[]')
    const checkins = JSON.parse(localStorage.getItem('loveDiary_checkins') || '[]')
    const photoRecords = JSON.parse(localStorage.getItem('loveDiary_photoRecords') || '[]')
    diaryCount.value = diaries.length
    checkinDays.value = checkins.length
    photoCount.value = photoRecords.reduce((total, record) => total + (record.photos?.length || 0), 0)
  } catch (error) {
    console.error('Load stats failed:', error)
  }
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.page-content > .card:first-child {
  padding: 30px 20px 24px;
  border: 0;
  background:
    radial-gradient(circle at 85% 15%, rgba(255,255,255,.5), transparent 22%),
    linear-gradient(145deg,#f4a0af,#db617a 58%,#b65d83);
  color: white;
  box-shadow: 0 15px 35px rgba(181,73,99,.22);
}
.page-content > .card:first-child :deep(.text-gray-500),
.page-content > .card:first-child :deep(.text-primary) { color: white !important; }
.page-content > .card:first-child :deep(.text-gray-500) { opacity: .72; }
.page-content > .card:first-child :deep(.rounded-full) {
  background: rgba(255,255,255,.2);
  border: 1px solid rgba(255,255,255,.35);
  box-shadow: 0 8px 22px rgba(88,32,48,.14);
}
.page-content > .card:nth-child(2) { background: linear-gradient(135deg,#fff,#fff6ed); }
.page-content > .card:nth-child(3) :deep(.py-3) { min-height: 50px; }
.page-content > .card:nth-child(3) :deep(.text-xl) {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 11px;
  background: #fff0f2;
  font-size: 16px;
}
</style>
