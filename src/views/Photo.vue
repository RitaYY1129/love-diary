<template>
  <div class="page-container">
    <div class="page-header">
      <button @click="goBack" class="btn-back">←</button>
      <h1 class="text-xl font-bold">足迹相册</h1>
    </div>

    <div class="page-content">
      <div class="card diary-card">
        <div class="diary-header">
          <span class="diary-date">{{ currentDate }}</span>
          <span class="diary-weather">{{ weather }}</span>
        </div>
        <textarea 
          v-model="diaryContent" 
          class="diary-input" 
          placeholder="今天的心情..."
          maxlength="500"
        ></textarea>
        <div class="diary-footer">
          <span class="char-count">{{ diaryContent.length }}/500</span>
        </div>
      </div>

      <div class="card photos-card">
        <div class="card-header">
          <h3 class="font-bold">今日足迹</h3>
          <button @click="addPhotos" class="btn btn-primary btn-sm">+ 添加照片</button>
        </div>
        
        <div v-if="photos.length === 0" class="empty-state">
          <div class="empty-icon">📷</div>
          <p>点击上方按钮添加今日照片</p>
        </div>
        
        <div v-else class="photos-grid">
          <div 
            v-for="(photo, index) in photos" 
            :key="index"
            class="photo-item"
          >
            <img :src="photo" alt="足迹照片" class="photo-img" @click="previewPhoto(index)" />
            <button @click="removePhoto(index)" class="remove-btn">×</button>
          </div>
          <div v-if="photos.length < 9" @click="addPhotos" class="add-photo-box">
            <span class="add-icon">+</span>
          </div>
        </div>
      </div>

      <div class="card history-card">
        <div class="card-header">
          <h3 class="font-bold">历史足迹</h3>
        </div>
        <div v-if="historyRecords.length === 0" class="empty-state">
          <div class="empty-icon">📅</div>
          <p>还没有历史记录</p>
        </div>
        <div v-else class="history-list">
          <div 
            v-for="(record, index) in historyRecords" 
            :key="index"
            class="history-item"
            @click="viewHistory(record)"
          >
            <div class="history-date">
              <div class="date-day">{{ record.day }}</div>
              <div class="date-month">{{ record.month }}</div>
            </div>
            <div class="history-content">
              <div class="history-preview" v-if="record.photos.length > 0">
                <img 
                  v-for="(photo, i) in record.photos.slice(0, 3)" 
                  :key="i" 
                  :src="photo" 
                  class="preview-img"
                />
                <span v-if="record.photos.length > 3" class="more-count">+{{ record.photos.length - 3 }}</span>
              </div>
              <p v-if="record.content" class="history-text">{{ record.content.slice(0, 30) }}{{ record.content.length > 30 ? '...' : '' }}</p>
              <p v-else class="history-text text-gray-400">暂无心情记录</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-bar">
      <div v-for="tab in tabs" :key="tab.path" @click="navigate(tab.path)" :class="['tab-item', currentPath === tab.path ? 'active' : '']">
        <span class="icon">{{ tab.icon }}</span>
        <span>{{ tab.label }}</span>
      </div>
    </div>

    <input type="file" ref="fileInput" multiple accept="image/*" @change="handleFileSelect" class="hidden" />
    
    <div v-if="showPreview" class="overlay show" @click="closePreview">
      <div class="preview-content" @click.stop>
        <button @click="closePreview" class="close-btn">×</button>
        <img :src="previewImage" alt="预览" class="preview-img-large" />
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
  { path: '/photo', icon: '📸', label: '足迹' },
  { path: '/location', icon: '📍', label: '位置' },
  { path: '/me', icon: '👤', label: '我的' }
]

const diaryContent = ref('')
const photos = ref([])
const historyRecords = ref([])
const fileInput = ref(null)
const showPreview = ref(false)
const previewImage = ref('')
const weather = ref('☀️ 晴天')

const goBack = () => {
  router.back()
}

const currentDate = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const day = now.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[now.getDay()]
  return `${year}年${month}月${day}日 ${weekDay}`
})

const loadData = () => {
  const savedRecords = localStorage.getItem('loveDiary_photoRecords')
  if (savedRecords) {
    historyRecords.value = JSON.parse(savedRecords)
  }
  
  const today = new Date().toDateString()
  const todayRecord = historyRecords.value.find(r => r.date === today)
  if (todayRecord) {
    diaryContent.value = todayRecord.content || ''
    photos.value = todayRecord.photos || []
  }
}

const saveTodayRecord = () => {
  const today = new Date().toDateString()
  const todayRecord = historyRecords.value.find(r => r.date === today)
  
  if (todayRecord) {
    todayRecord.content = diaryContent.value
    todayRecord.photos = photos.value
  } else {
    const now = new Date()
    historyRecords.value.unshift({
      date: today,
      day: now.getDate(),
      month: `${now.getMonth() + 1}月`,
      content: diaryContent.value,
      photos: photos.value
    })
  }
  
  localStorage.setItem('loveDiary_photoRecords', JSON.stringify(historyRecords.value))
}

const addPhotos = () => {
  fileInput.value?.click()
}

const handleFileSelect = (e) => {
  const files = e.target.files
  if (files && files.length > 0) {
    const maxCount = 9 - photos.value.length
    const actualCount = Math.min(files.length, maxCount)
    
    for (let i = 0; i < actualCount; i++) {
      const reader = new FileReader()
      reader.onload = (event) => {
        photos.value.push(event.target.result)
        saveTodayRecord()
      }
      reader.readAsDataURL(files[i])
    }
    e.target.value = ''
  }
}

const removePhoto = (index) => {
  photos.value.splice(index, 1)
  saveTodayRecord()
}

const previewPhoto = (index) => {
  previewImage.value = photos.value[index]
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
}

const viewHistory = (record) => {
  diaryContent.value = record.content || ''
  photos.value = record.photos || []
}

const navigate = (path) => {
  if (path !== currentPath.value) {
    saveTodayRecord()
    router.push(path)
  }
}

onMounted(() => {
  loadData()
  setInterval(saveTodayRecord, 3000)
})
</script>

<style scoped>
.page-container { min-height: 100vh; padding-bottom: 92px; background: linear-gradient(180deg,#fff8f8,#fffaf6); }
.page-header { display: flex; align-items: center; justify-content: center; min-height: 72px; padding: 14px 20px; background: rgba(255,250,249,.92); border-bottom: 1px solid #f1dfe2; backdrop-filter: blur(18px); position: sticky; top: 0; z-index: 20; }
.btn-back { position: absolute; left: 20px; width: 38px; height: 38px; border-radius: 12px; border: 1px solid #f0dfe2; background: rgba(255,255,255,.8); color: #74525a; font-size: 17px; cursor: pointer; box-shadow:0 5px 16px rgba(112,60,72,.07); }
.card { background: rgba(255,255,255,.94); border: 1px solid #f1dfe2; border-radius: 19px; padding: 20px; margin-bottom: 15px; box-shadow: 0 8px 28px rgba(126,70,82,.07); }
.card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.diary-card { background: linear-gradient(135deg, #fff 0%, #fff0f2 100%); }
.diary-header { display: flex; justify-content: space-between; margin-bottom: 12px; }
.diary-date { font-size: 14px; color: #666; }
.diary-input { width: 100%; min-height: 100px; border: none; resize: none; font-size: 15px; line-height: 1.6; background: transparent; }
.diary-input::placeholder { color: #ccc; }
.char-count { font-size: 12px; color: #999; }
.empty-state { text-align: center; padding: 40px; color: #999; }
.empty-icon { font-size: 48px; margin-bottom: 12px; }
.photos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.photo-item { position: relative; aspect-ratio: 1; border-radius: 15px; overflow: hidden; box-shadow: 0 5px 15px rgba(83,48,57,.1); }
.photo-img { width: 100%; height: 100%; object-fit: cover; }
.remove-btn { position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; border-radius: 50%; background: rgba(0,0,0,0.6); color: white; border: none; opacity: 0; cursor: pointer; }
.photo-item:hover .remove-btn { opacity: 1; }
.add-photo-box { aspect-ratio: 1; border-radius: 15px; border: 1.5px dashed #efb9c4; background:#fff7f8; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.add-icon { font-size: 28px; color: #da6178; }
.history-list { display: flex; flex-direction: column; gap: 12px; }
.history-item { display: flex; gap: 15px; padding: 15px; background: #fff8f8; border:1px solid #f3e3e5; border-radius: 15px; cursor: pointer; }
.history-date { display: flex; flex-direction: column; align-items: center; min-width: 50px; }
.date-day { font-size: 24px; font-weight: 600; }
.date-month { font-size: 12px; color: #999; }
.history-preview { display: flex; gap: 5px; margin-bottom: 8px; }
.preview-img { width: 45px; height: 45px; border-radius: 8px; object-fit: cover; }
.more-count { width: 45px; height: 45px; border-radius: 8px; background: #eee; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666; }
.history-text { font-size: 14px; color: #666; }
.overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; }
.preview-content { position: relative; max-width: 90%; }
.close-btn { position: absolute; top: -40px; right: 0; width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.2); color: white; border: none; font-size: 20px; cursor: pointer; }
.preview-img-large { max-width: 100%; max-height: 80vh; border-radius: 12px; }
.tab-bar { position: fixed; bottom: 0; left:50%; width:min(100%,720px); transform:translateX(-50%); background: rgba(255,252,251,.96); border:1px solid #f0dce0; border-bottom:0; border-radius:20px 20px 0 0; box-shadow:0 -8px 28px rgba(112,62,73,.08); display: flex; justify-content: space-around; padding: 10px 0; backdrop-filter:blur(18px); }
.tab-item { display: flex; flex-direction: column; align-items: center; padding: 5px 16px; color: #b9a1a6; cursor: pointer; border-radius:13px; }
.tab-item.active { color: #cb536a; background:#ffedf0; }
.tab-item .icon { font-size: 20px; margin-bottom: 3px; }
.btn { padding: 7px 14px; border-radius: 11px; border: none; font-size: 12px; cursor: pointer; }
.btn-primary { background: linear-gradient(115deg, #df637a, #c94f69); color: white; box-shadow:0 6px 16px rgba(201,79,105,.2); }
.hidden { display: none; }
</style>
