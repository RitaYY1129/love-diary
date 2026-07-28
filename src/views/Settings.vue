<template>
  <div class="page-container">
    <div class="page-header">
      <button @click="goBack" class="btn-back">←</button>
      <h1 class="text-xl font-bold">设置</h1>
    </div>

    <div class="page-content">
      <div class="card mb-4">
        <h3 class="font-bold mb-3">账号设置</h3>
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <span>修改昵称</span>
          <button @click="openNicknameModal" class="text-primary text-sm">修改</button>
        </div>
        <div class="flex items-center justify-between py-3 border-b border-gray-100">
          <span>修改密码</span>
          <button @click="openPasswordModal" class="text-primary text-sm">修改</button>
        </div>
        <div class="flex items-center justify-between py-3">
          <span>绑定手机号</span>
          <span class="text-gray-400">{{ user?.phone || '未绑定' }}</span>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="font-bold mb-3">隐私设置</h3>
        <div class="flex items-center justify-between py-3">
          <span>允许另一半查看日记</span>
          <label class="switch">
            <input type="checkbox" v-model="privacySettings.shareDiary" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="flex items-center justify-between py-3">
          <span>允许另一半查看心情</span>
          <label class="switch">
            <input type="checkbox" v-model="privacySettings.shareMood" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="flex items-center justify-between py-3">
          <span>允许另一半查看相册</span>
          <label class="switch">
            <input type="checkbox" v-model="privacySettings.sharePhoto" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="card mb-4">
        <h3 class="font-bold mb-3">通知设置</h3>
        <div class="flex items-center justify-between py-3">
          <span>纪念日提醒</span>
          <label class="switch">
            <input type="checkbox" v-model="notificationSettings.anniversary" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="flex items-center justify-between py-3">
          <span>每日打卡提醒</span>
          <label class="switch">
            <input type="checkbox" v-model="notificationSettings.checkin" />
            <span class="slider"></span>
          </label>
        </div>
        <div class="flex items-center justify-between py-3">
          <span>计划提醒</span>
          <label class="switch">
            <input type="checkbox" v-model="notificationSettings.plan" />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div class="card mb-4">
        <div 
          v-for="item in aboutItems" 
          :key="item.label"
          @click="handleAboutClick(item)"
          class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
        >
          <span>{{ item.label }}</span>
          <span class="text-gray-400">→</span>
        </div>
      </div>

      <button @click="handleClearCache" class="btn btn-secondary btn-block mb-4">清除缓存</button>
      <button @click="handleExportData" class="btn btn-primary btn-block mb-4">导出数据</button>
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

    <div v-if="showNicknameModal" class="overlay show" @click.self="closeNicknameModal">
      <div class="overlay-box p-6">
        <h3 class="text-lg font-bold mb-4">修改昵称</h3>
        <input 
          v-model="newNickname" 
          type="text" 
          class="form-input mb-4" 
          placeholder="请输入新昵称"
        />
        <div class="flex gap-3">
          <button @click="closeNicknameModal" class="btn btn-secondary flex-1">取消</button>
          <button @click="saveNickname" class="btn btn-primary flex-1">保存</button>
        </div>
      </div>
    </div>

    <div v-if="showPasswordModal" class="overlay show" @click.self="closePasswordModal">
      <div class="overlay-box p-6">
        <h3 class="text-lg font-bold mb-4">修改密码</h3>
        <input 
          v-model="passwordForm.oldPassword" 
          type="password" 
          class="form-input mb-4" 
          placeholder="原密码"
        />
        <input 
          v-model="passwordForm.newPassword" 
          type="password" 
          class="form-input mb-4" 
          placeholder="新密码"
        />
        <input 
          v-model="passwordForm.confirmPassword" 
          type="password" 
          class="form-input mb-4" 
          placeholder="确认新密码"
        />
        <div class="flex gap-3">
          <button @click="closePasswordModal" class="btn btn-secondary flex-1">取消</button>
          <button @click="savePassword" class="btn btn-primary flex-1">保存</button>
        </div>
      </div>
    </div>

    <div :class="['toast', toast.show ? 'show' : '']">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
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

const aboutItems = [
  { label: '关于我们', action: 'about' },
  { label: '用户协议', action: 'terms' },
  { label: '隐私政策', action: 'privacy' },
  { label: '版本号', action: 'version' }
]

const user = computed(() => authStore.user)

const privacySettings = ref({
  shareDiary: true,
  shareMood: true,
  sharePhoto: true
})

const notificationSettings = ref({
  anniversary: true,
  checkin: true,
  plan: true
})

watch([privacySettings, notificationSettings], () => {
  localStorage.setItem('loveDiary_preferences', JSON.stringify({
    privacy: privacySettings.value,
    notifications: notificationSettings.value
  }))
}, { deep: true })

const showNicknameModal = ref(false)
const showPasswordModal = ref(false)
const newNickname = ref('')

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

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

const goBack = () => {
  router.back()
}

const navigate = (path) => {
  if (path !== currentPath.value) {
    router.push(path)
  }
}

const openNicknameModal = () => {
  newNickname.value = user.value?.nickname || ''
  showNicknameModal.value = true
}

const closeNicknameModal = () => {
  showNicknameModal.value = false
}

const saveNickname = async () => {
  if (!newNickname.value.trim()) {
    showToast('请输入昵称')
    return
  }
  
  authStore.user.nickname = newNickname.value.trim()
  localStorage.setItem('loveDiary_user', JSON.stringify(authStore.user))
  showToast('修改成功')
  closeNicknameModal()
}

const openPasswordModal = () => {
  passwordForm.value = { oldPassword: '', newPassword: '', confirmPassword: '' }
  showPasswordModal.value = true
}

const closePasswordModal = () => {
  showPasswordModal.value = false
}

const savePassword = async () => {
  if (!passwordForm.value.oldPassword) {
    showToast('请输入原密码')
    return
  }
  if (!passwordForm.value.newPassword) {
    showToast('请输入新密码')
    return
  }
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showToast('两次输入的密码不一致')
    return
  }
  
  const storedPassword = localStorage.getItem('loveDiary_localPassword')
  if (storedPassword && storedPassword !== passwordForm.value.oldPassword) {
    showToast('原密码不正确')
    return
  }
  localStorage.setItem('loveDiary_localPassword', passwordForm.value.newPassword)
  showToast('修改成功')
  closePasswordModal()
}

const handleAboutClick = (item) => {
  if (item.action === 'version') {
    showToast('版本号: 2.0.0')
  } else {
    alert(`${item.label}功能开发中`)
  }
}

const handleClearCache = () => {
  if (confirm('确定要清除缓存吗？')) {
    localStorage.clear()
    showToast('缓存已清除')
  }
}

const handleExportData = () => {
  const data = {}
  Object.keys(localStorage).filter(key => key.startsWith('loveDiary_')).forEach(key => {
    try { data[key] = JSON.parse(localStorage.getItem(key)) } catch { data[key] = localStorage.getItem(key) }
  })
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `love-diary-backup-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(link.href)
  showToast('数据已导出')
}

onMounted(() => {
  const stored = localStorage.getItem('loveDiary_preferences')
  if (!stored) return
  try {
    const preferences = JSON.parse(stored)
    if (preferences.privacy) privacySettings.value = preferences.privacy
    if (preferences.notifications) notificationSettings.value = preferences.notifications
  } catch {}
})
</script>
