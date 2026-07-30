<template>
  <div class="page-container">
    <div class="page-header">
      <button @click="goBack" class="btn-back">←</button>
      <h1 class="text-xl font-bold">数据统计</h1>
    </div>

    <div class="page-content">
      <div class="card mb-4">
        <h3 class="font-bold mb-4">恋爱时长</h3>
        <div class="text-center py-6">
          <div class="text-5xl font-bold text-primary">{{ loveDays }}</div>
          <div class="text-gray-500 mt-2">天</div>
        </div>
        <div class="grid grid-cols-3 gap-4 mt-4">
          <div class="text-center">
            <div class="text-2xl font-bold">{{ months }}</div>
            <div class="text-xs text-gray-500">个月</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ weeks }}</div>
            <div class="text-xs text-gray-500">周</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold">{{ hours }}</div>
            <div class="text-xs text-gray-500">小时</div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="font-bold mb-4">互动统计</h3>
        <div class="space-y-4">
          <div class="flex justify-between items-center">
            <span>日记数量</span>
            <span class="text-xl font-bold text-primary">{{ stats.diaryCount }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>心情记录</span>
            <span class="text-xl font-bold text-primary">{{ stats.moodCount }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>打卡天数</span>
            <span class="text-xl font-bold text-primary">{{ stats.checkinCount }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span>照片数量</span>
            <span class="text-xl font-bold text-primary">{{ stats.photoCount }}</span>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="font-bold mb-4">本月心情分布</h3>
        <div class="space-y-3">
          <div v-for="mood in moodStats" :key="mood.label" class="flex items-center gap-3">
            <span class="text-lg w-8">{{ mood.emoji }}</span>
            <div class="flex-1">
              <div class="flex justify-between text-sm mb-1">
                <span>{{ mood.label }}</span>
                <span>{{ mood.count }}次</span>
              </div>
              <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-primary rounded-full transition-all"
                  :style="{ width: mood.percent + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h3 class="font-bold mb-4">成就徽章</h3>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const currentPath = computed(() => route.path)

const tabs = [
  { path: '/home', icon: '🏠', label: '首页' },
  { path: '/anniversary', icon: '♡', label: '纪念日' },
  { path: '/chat', icon: '💬', label: '聊天' },
  { path: '/location', icon: '📍', label: '位置' },
  { path: '/me', icon: '👤', label: '我的' }
]

const loveDays = ref(156)

const months = computed(() => Math.floor(loveDays.value / 30))
const weeks = computed(() => Math.floor(loveDays.value / 7))
const hours = computed(() => loveDays.value * 24)

const stats = ref({
  diaryCount: 23,
  moodCount: 156,
  checkinCount: 128,
  photoCount: 89
})

const moodStats = ref([
  { emoji: '😄', label: '开心', count: 45, percent: 35 },
  { emoji: '🥰', label: '甜蜜', count: 38, percent: 30 },
  { emoji: '😊', label: '平静', count: 25, percent: 20 },
  { emoji: '😢', label: '难过', count: 12, percent: 10 },
  { emoji: '😤', label: '生气', count: 6, percent: 5 }
])

const badges = ref([
  { id: 1, name: '初来乍到', icon: '🌱', unlocked: true },
  { id: 2, name: '坚持不懈', icon: '🔥', unlocked: true },
  { id: 3, name: '月度冠军', icon: '👑', unlocked: false },
  { id: 4, name: '百日达人', icon: '💯', unlocked: true },
  { id: 5, name: '心情丰富', icon: '🎨', unlocked: true },
  { id: 6, name: '记录达人', icon: '📝', unlocked: true },
  { id: 7, name: '摄影大师', icon: '📸', unlocked: false },
  { id: 8, name: '恋爱专家', icon: '💘', unlocked: false }
])

const goBack = () => {
  router.back()
}

const navigate = (path) => {
  if (path !== currentPath.value) {
    router.push(path)
  }
}

onMounted(() => {})
</script>
