<template>
  <div class="page-container">
    <div class="page-header">
      <button @click="goBack" class="btn-back">←</button>
      <h1 class="text-xl font-bold">心情记录</h1>
    </div>

    <div class="page-content">
      <div class="card mb-4">
        <h2 class="font-bold mb-4">今日心情</h2>
        <div v-if="todayMood" class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <span class="text-5xl">{{ todayMood.emoji }}</span>
            <div>
              <div class="text-xl font-medium">{{ getMoodLabel(todayMood.mood) }}</div>
              <div class="text-sm text-gray-500">今天 {{ formatTime(todayMood.createdAt) }}</div>
            </div>
          </div>
          <button @click="openEditModal" class="text-primary text-sm">修改</button>
        </div>
        <div v-else class="text-center py-8">
          <div class="text-6xl mb-4">🌤️</div>
          <div class="text-gray-500 mb-4">今天还没有记录心情</div>
          <button @click="openCreateModal" class="btn btn-primary">记录心情</button>
        </div>
      </div>

      <div class="card">
        <h2 class="font-bold mb-4">本周心情趋势</h2>
        <div class="flex justify-between items-center">
          <div 
            v-for="day in weekMoods" 
            :key="day.date"
            class="flex flex-col items-center"
          >
            <span class="text-xs text-gray-500 mb-2">{{ day.label }}</span>
            <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="day.color">
              <span class="text-xl">{{ day.emoji }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="font-bold mb-4">心情统计</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-primary">{{ stats.total }}</div>
            <div class="text-xs text-gray-500">总记录</div>
          </div>
          <div class="bg-gray-50 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-primary">{{ stats.avgScore }}</div>
            <div class="text-xs text-gray-500">平均心情指数</div>
          </div>
          <div class="bg-gray-50 rounded-xl p-4 text-center">
            <div class="text-2xl">{{ stats.topMood?.emoji }}</div>
            <div class="text-xs text-gray-500">最常出现</div>
          </div>
          <div class="bg-gray-50 rounded-xl p-4 text-center">
            <div class="text-2xl font-bold text-primary">{{ stats.streak }}</div>
            <div class="text-xs text-gray-500">连续记录</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2 class="font-bold mb-4">历史记录</h2>
        <div v-if="moodHistory.length > 0">
          <div 
            v-for="mood in moodHistory" 
            :key="mood.id"
            class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ mood.emoji }}</span>
              <div>
                <div class="font-medium">{{ getMoodLabel(mood.mood) }}</div>
                <div class="text-xs text-gray-500">{{ formatDate(normalizeDate(mood)) }}</div>
              </div>
            </div>
            <button @click="deleteMood(mood.id)" class="text-danger text-sm">删除</button>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-400">
          <div class="text-4xl mb-2">📊</div>
          <div>暂无历史记录</div>
        </div>
      </div>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>

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

    <div v-if="showMoodModal" class="overlay show" @click.self="closeMoodModal">
      <div class="overlay-box p-6">
        <h3 class="text-lg font-bold mb-4">{{ editingMood ? '修改心情' : '记录心情' }}</h3>
        <div class="grid grid-cols-5 gap-3 mb-4">
          <button 
            v-for="mood in moods" 
            :key="mood.value"
            @click="selectedMood = mood"
            :class="['flex flex-col items-center p-3 rounded-xl transition-all', selectedMood?.value === mood.value ? 'bg-primary/10' : 'bg-gray-100']"
          >
            <span class="text-3xl">{{ mood.emoji }}</span>
            <span class="text-xs mt-1">{{ mood.label }}</span>
          </button>
        </div>
        <textarea 
          v-model="moodNote" 
          class="form-textarea mb-4" 
          placeholder="记录一下心情..."
        ></textarea>
        <div class="flex gap-3">
          <button @click="closeMoodModal" class="btn btn-secondary flex-1">取消</button>
          <button :disabled="saving" @click="saveMood" class="btn btn-primary flex-1">
            {{ saving ? '保存中...' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMoodStore } from '@/stores/mood'

const router = useRouter()
const route = useRoute()
const moodStore = useMoodStore()

const currentPath = computed(() => route.path)

const tabs = [
  { path: '/home', icon: '🏠', label: '首页' },
  { path: '/anniversary', icon: '♡', label: '纪念日' },
  { path: '/chat', icon: '💬', label: '聊天' },
  { path: '/location', icon: '📍', label: '位置' },
  { path: '/me', icon: '👤', label: '我的' }
]

const moods = [
  { value: 'happy', emoji: '😄', label: '开心', color: 'bg-yellow-100' },
  { value: 'love', emoji: '🥰', label: '甜蜜', color: 'bg-pink-100' },
  { value: 'excited', emoji: '🤩', label: '兴奋', color: 'bg-orange-100' },
  { value: 'calm', emoji: '😊', label: '平静', color: 'bg-blue-100' },
  { value: 'tired', emoji: '😴', label: '疲惫', color: 'bg-gray-100' },
  { value: 'sad', emoji: '😢', label: '难过', color: 'bg-blue-200' },
  { value: 'angry', emoji: '😤', label: '生气', color: 'bg-red-100' },
  { value: 'anxious', emoji: '😰', label: '焦虑', color: 'bg-purple-100' },
  { value: 'confused', emoji: '😕', label: '困惑', color: 'bg-green-100' },
  { value: 'lonely', emoji: '🥺', label: '孤单', color: 'bg-indigo-100' }
]

const moodHistory = ref([])
const todayMood = ref(null)
const showMoodModal = ref(false)
const editingMood = ref(null)
const selectedMood = ref(null)
const moodNote = ref('')
const saving = ref(false)
const toast = ref('')

const showToast = (message) => {
  toast.value = message
  setTimeout(() => { toast.value = '' }, 2500)
}

const stats = ref({
  total: 0,
  avgScore: 0,
  topMood: null,
  streak: 0
})

const weekMoods = computed(() => {
  const days = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    const mood = moodHistory.value.find(m => normalizeDate(m) === dateStr)
    const moodConfig = mood ? moods.find(m => m.value === mood.mood) : null

    days.push({
      date: dateStr,
      label: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
      emoji: moodConfig?.emoji || '⬜',
      color: moodConfig?.color || 'bg-gray-200'
    })
  }

  return days
})

const getMoodLabel = (moodValue) => {
  const mood = moods.find(m => m.value === moodValue)
  return mood?.label || moodValue
}

const normalizeDate = (m) => m?.date || m?.created_at?.slice(0, 10) || ''

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const formatTime = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

const goBack = () => {
  router.back()
}

const navigate = (path) => {
  if (path !== currentPath.value) {
    router.push(path)
  }
}

const openCreateModal = () => {
  editingMood.value = null
  selectedMood.value = moods[0]
  moodNote.value = ''
  showMoodModal.value = true
}

const openEditModal = () => {
  editingMood.value = todayMood.value
  selectedMood.value = moods.find(m => m.value === todayMood.value.mood) || moods[0]
  moodNote.value = todayMood.value.note || ''
  showMoodModal.value = true
}

const closeMoodModal = () => {
  showMoodModal.value = false
  editingMood.value = null
}

const saveMood = async () => {
  if (!selectedMood.value) return
  saving.value = true
  try {
    const data = {
      mood: selectedMood.value.value,
      emoji: selectedMood.value.emoji,
      note: moodNote.value
    }
    if (editingMood.value) {
      await moodStore.update(editingMood.value.id, data)
    } else {
      await moodStore.create(data)
    }
    closeMoodModal()
    await loadData()
    showToast(editingMood.value ? '心情已更新' : '心情已记录')
  } catch (error) {
    showToast(error?.message || '保存失败')
  } finally {
    saving.value = false
  }
}

const deleteMood = async (id) => {
  if (confirm('确定要删除这条心情记录吗？')) {
    try {
      await moodStore.delete(id)
      await loadData()
    } catch (error) {
      showToast(error?.message || '删除失败')
    }
  }
}

const loadData = async () => {
  await moodStore.list()
  moodHistory.value = moodStore.moods
  todayMood.value = moodStore.getToday()
  stats.value = await moodStore.stats() || { total: 0, avgScore: 0, topMood: null, streak: 0 }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.page-content > .card:first-child {
  min-height: 170px;
  background:
    radial-gradient(circle at 88% 18%,rgba(255,255,255,.6),transparent 24%),
    linear-gradient(140deg,#ffe8ec,#f6e8f7);
  border-color:#f1d8df;
}
.page-content > .card:first-child h2 { color:#6b4450; }
.page-content > .card:nth-child(2) :deep(.rounded-full) {
  box-shadow:0 4px 12px rgba(112,65,77,.08);
}
.page-content > .card:nth-child(3) :deep(.bg-gray-50) {
  border:1px solid #f2e3e5;
  background:linear-gradient(145deg,#fffafa,#fff5f4) !important;
}
.page-content > .card:last-child :deep(.border-b) { min-height:58px; }
.toast {
  position: fixed;
  left: 50%;
  bottom: 90px;
  transform: translateX(-50%);
  padding: 10px 18px;
  border-radius: 22px;
  background: rgba(50, 40, 45, .88);
  color: #fff;
  font-size: 13px;
  z-index: 1000;
  pointer-events: none;
}
</style>
