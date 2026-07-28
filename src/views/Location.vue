<template>
  <div class="page-container">
    <div class="page-header">
      <button @click="goBack" class="btn-back">←</button>
      <h1 class="text-xl font-bold">位置</h1>
      <div class="w-10"></div>
    </div>

    <div class="page-content">
      <div v-if="!isPartnerBound" class="card mb-4">
        <div class="text-center py-8">
          <div class="text-4xl mb-4">💑</div>
          <div class="font-bold mb-2">还未绑定另一半</div>
          <div class="text-sm text-gray-500 mb-4">绑定后可以查看对方位置</div>
          <button @click="goToBindPartner" class="btn btn-primary">去绑定</button>
        </div>
      </div>

      <div v-else>
        <div class="card mb-4 map-section">
          <div class="map-container">
            <div class="map-grid"></div>
            <div class="partner-marker" :style="{ top: '35%', left: '55%' }">
              <div class="avatar-marker partner">👩</div>
              <div class="marker-pulse"></div>
            </div>
            <div class="my-marker" :style="{ top: '45%', left: '45%' }">
              <div class="avatar-marker me">👨</div>
              <div class="marker-pulse"></div>
            </div>
            <div class="shared-marker" :style="{ top: '25%', left: '65%' }">
              <div class="avatar-marker shared">📍</div>
            </div>
          </div>
          
          <div class="partner-stats">
            <div class="stat-item">
              <span class="stat-dot online"></span>
              <span>她在线</span>
            </div>
            <div class="stat-item">
              <span class="stat-dot distance"></span>
              <span>距离 2.3km</span>
            </div>
            <div class="stat-item">
              <span class="stat-dot checkin"></span>
              <span>2 次打卡</span>
            </div>
          </div>

          <div class="partner-info">
            <div class="avatar-wrapper">
              <div class="partner-avatar">👩</div>
              <span class="online-dot"></span>
            </div>
            <div class="partner-detail">
              <div class="partner-name">{{ authStore.user?.partner?.nickname || '小可爱' }}</div>
              <div class="partner-status">
                <span class="status-dot"></span>
                在线 · 在家
              </div>
            </div>
            <div class="update-time">刚更新</div>
          </div>

          <div class="location-info">
            <div class="location-icon">📍</div>
            <div class="location-detail">
              <div class="location-name">{{ currentLocation.address }}</div>
              <div class="location-meta">距离你 2.3km · 15分钟</div>
            </div>
            <button class="nav-btn" @click="openNavi">导航</button>
          </div>

          <div class="location-meta-info">
            <span class="meta-item">📅 今天 18:30</span>
            <span class="meta-divider">|</span>
            <span class="meta-item">⏱️ 1.5小时</span>
          </div>
        </div>

        <div class="sharing-toggle">
          <div class="toggle-icon">🗺️</div>
          <div class="toggle-content">
            <div class="toggle-title">位置共享</div>
            <div class="toggle-desc">共享后对方可看到你的实时位置</div>
          </div>
          <label class="switch">
            <input type="checkbox" v-model="locationSharing" @change="toggleSharing" />
            <span class="slider"></span>
          </label>
        </div>

        <div class="section">
          <div class="section-header">
            <span class="section-icon">📖</span>
            <h2 class="section-title">历史记录</h2>
          </div>
          
          <div class="history-list">
            <div v-for="(item, index) in historyRecords" :key="index" class="history-item">
              <div class="history-icon">{{ item.icon }}</div>
              <div class="history-info">
                <div class="history-name">{{ item.name }}</div>
                <div class="history-time">{{ item.time }}</div>
              </div>
              <span v-if="item.current" class="current-badge">当前</span>
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-header">
            <span class="section-icon">🏆</span>
            <h2 class="section-title">我的打卡</h2>
          </div>
          
          <div class="checkin-list">
            <div v-for="(item, index) in checkinRecords" :key="index" class="checkin-item">
              <div class="checkin-icon">📍</div>
              <div class="checkin-info">
                <div class="checkin-name">{{ item.name }}</div>
                <div class="checkin-time">{{ item.time }}</div>
              </div>
              <span class="checkin-points">+{{ item.points }}</span>
            </div>
          </div>
        </div>

        <div class="safety-note">
            <span class="note-icon">🔒</span>
            <span class="note-text">位置信息仅双方可见，可随时关闭共享</span>
          </div>

        <button 
          @click="getCurrentLocation" 
          :disabled="isGettingLocation"
          class="refresh-location-btn"
        >
          <span v-if="isGettingLocation" class="loading-spinner"></span>
          <span v-else>🔄</span>
          {{ isGettingLocation ? '定位中...' : '刷新定位' }}
        </button>
      </div>
    </div>

    <div v-if="showMapSelector" class="overlay show" @click.self="showMapSelector = false">
      <div class="overlay-box p-6">
        <h3 class="text-lg font-bold mb-4">选择导航应用</h3>
        <div class="map-apps-grid">
          <div 
            v-for="app in mapApps" 
            :key="app.name"
            @click="openMapApp(app)"
            class="map-app-item"
          >
            <div class="app-icon">{{ app.icon }}</div>
            <div class="app-name">{{ app.name }}</div>
          </div>
        </div>
        <button @click="showMapSelector = false" class="btn btn-secondary btn-block mt-4">取消</button>
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

const isPartnerBound = computed(() => authStore.user?.partner !== null)
const locationSharing = ref(true)
const isGettingLocation = ref(false)
const currentLocation = ref({
  lat: 39.9902,
  lng: 116.4735,
  address: '北京市朝阳区望京花园'
})
const showMapSelector = ref(false)

const historyRecords = ref([
  { icon: '🍲', name: '海底捞（望京店）', time: '今天 18:30 · 1.5小时', current: false },
  { icon: '🎬', name: '万达影城', time: '昨天 20:00 · 2小时', current: false },
  { icon: '🏬', name: '望京凯德MALL', time: '3天前 · 3小时', current: false },
  { icon: '🌳', name: '望京公园', time: '本周 · 45分钟', current: true }
])

const checkinRecords = ref([
  { name: '海底捞（望京店）', time: '今天 18:30', points: 10 },
  { name: '万达影城', time: '昨天 20:00', points: 10 }
])

const mapApps = ref([
  { name: '高德地图', icon: '🗺️', scheme: 'amap', package: 'com.autonavi.minimap' },
  { name: '百度地图', icon: '📍', scheme: 'bdapp', package: 'com.baidu.BaiduMap' },
  { name: '腾讯地图', icon: '🌍', scheme: 'qqmap', package: 'com.tencent.map' },
  { name: 'Apple地图', icon: '🍎', scheme: 'maps', package: 'apple-maps' }
])

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

const goToBindPartner = () => {
  router.push('/me')
}

const toggleSharing = () => {
  if (locationSharing.value) {
    showToast('已开启位置共享')
  } else {
    showToast('已关闭位置共享')
  }
}

const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    showToast('您的浏览器不支持GPS定位')
    return
  }

  isGettingLocation.value = true
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      currentLocation.value = {
        lat: latitude,
        lng: longitude,
        address: '定位中...'
      }
      
      reverseGeocode(latitude, longitude)
      isGettingLocation.value = false
      showToast('定位成功')
    },
    (error) => {
      isGettingLocation.value = false
      switch (error.code) {
        case error.PERMISSION_DENIED:
          showToast('请在系统设置中开启位置权限')
          break
        case error.POSITION_UNAVAILABLE:
          showToast('无法获取当前位置')
          break
        case error.TIMEOUT:
          showToast('定位超时')
          break
        default:
          showToast('定位失败')
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

const reverseGeocode = (lat, lng) => {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`)
    .then(response => response.json())
    .then(data => {
      if (data.display_name) {
        const addressParts = data.display_name.split(',')
        if (addressParts.length >= 3) {
          currentLocation.value.address = addressParts.slice(-3).reverse().join(' ')
        } else {
          currentLocation.value.address = data.display_name
        }
      }
    })
    .catch(() => {
      currentLocation.value.address = '北京市朝阳区望京花园'
    })
}

const openMapApp = (app) => {
  const { lat, lng, address } = currentLocation.value
  let url = ''
  
  switch (app.scheme) {
    case 'amap':
      url = `amapuri://route/plan/?dlat=${lat}&dlng=${lng}&dname=${encodeURIComponent(address)}&dev=0`
      break
    case 'bdapp':
      url = `baidumap://map/direction?destination=latlng:${lat},${lng}|name:${encodeURIComponent(address)}&mode=driving`
      break
    case 'qqmap':
      url = `qqmap://map/routeplan?type=drive&to=${encodeURIComponent(address)}&tocoord=${lat},${lng}&referer=love-diary`
      break
    case 'maps':
      url = `maps://maps.google.com/maps?daddr=${lat},${lng}&dirflg=d`
      break
  }
  
  window.location.href = url
  showMapSelector.value = false
  
  setTimeout(() => {
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
      window.location.href = `https://apps.apple.com/cn/app/%E9%AB%98%E5%BE%B7%E5%9C%B0%E5%9B%BE/id461703208`
    } else {
      window.location.href = `https://a.app.qq.com/o/simple.jsp?pkgname=${app.package}`
    }
  }, 500)
}

const openNavi = () => {
  showMapSelector.value = true
}

onMounted(() => {
  getCurrentLocation()
})
</script>

<style scoped>
.map-section {
  padding: 0;
  overflow: hidden;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(255, 107, 157, 0.15);
}

.map-container {
  position: relative;
  height: 220px;
  background: linear-gradient(180deg, #ff6b9d 0%, #ff8fc4 50%, #ffaec0 100%);
  border-radius: 24px 24px 0 0;
}

.map-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 40px 40px;
}

.heart-decoration {
  position: absolute;
  top: 20px;
  right: 20px;
  font-size: 24px;
  animation: float-heart 3s ease-in-out infinite;
}

@keyframes float-heart {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-10px) scale(1.1); }
}

.avatar-marker {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  position: relative;
  z-index: 2;
  border: 4px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.avatar-marker.partner {
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
}

.avatar-marker.me {
  background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
}

.avatar-marker.shared {
  background: rgba(255, 255, 255, 0.9);
  font-size: 24px;
}

.partner-marker, .my-marker, .shared-marker {
  position: absolute;
  transform: translate(-50%, -50%);
}

.marker-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
  50% { transform: translate(-50%, -50%) scale(1.4); opacity: 0; }
}

.partner-stats {
  display: flex;
  justify-content: center;
  gap: 40px;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #f5f5f5;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #333;
}

.stat-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #52c41a;
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.4);
}

.stat-dot.distance {
  background: #1890ff;
  box-shadow: 0 0 8px rgba(24, 144, 255, 0.4);
}

.stat-dot.checkin {
  background: #faad14;
  box-shadow: 0 0 8px rgba(250, 173, 20, 0.4);
}

.partner-info {
  display: flex;
  align-items: center;
  padding: 20px;
  background: white;
}

.avatar-wrapper {
  position: relative;
  margin-right: 16px;
}

.partner-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  box-shadow: 0 4px 12px rgba(253, 203, 110, 0.4);
}

.online-dot {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #52c41a;
  border: 3px solid white;
  box-shadow: 0 0 8px rgba(82, 196, 26, 0.5);
}

.partner-detail {
  flex: 1;
}

.partner-name {
  font-weight: 600;
  font-size: 17px;
  margin-bottom: 4px;
  color: #2d2d2d;
}

.partner-status {
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #52c41a;
  box-shadow: 0 0 6px rgba(82, 196, 26, 0.5);
}

.update-time {
  font-size: 13px;
  color: #999;
}

.location-info {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(135deg, #fff9f0 0%, #fff5e6 100%);
  border-top: 1px solid #ffe8cc;
}

.location-icon {
  font-size: 22px;
  margin-right: 14px;
}

.location-detail {
  flex: 1;
}

.location-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 3px;
  color: #2d2d2d;
}

.location-meta {
  font-size: 13px;
  color: #888;
}

.nav-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 14px rgba(255, 107, 157, 0.4);
  transition: all 0.3s ease;
}

.nav-btn:active {
  transform: scale(0.96);
}

.location-meta-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 14px;
  background: white;
  border-top: 1px solid #f5f5f5;
  font-size: 13px;
  color: #888;
}

.meta-divider {
  color: #e0e0e0;
}

.sharing-toggle {
  display: flex;
  align-items: center;
  padding: 18px;
  background: white;
  border-radius: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.toggle-icon {
  font-size: 28px;
  margin-right: 14px;
}

.toggle-content {
  flex: 1;
}

.toggle-title {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 2px;
  color: #2d2d2d;
}

.toggle-desc {
  font-size: 13px;
  color: #888;
}

.section {
  background: white;
  border-radius: 20px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.section-icon {
  font-size: 22px;
}

.section-title {
  font-size: 17px;
  font-weight: 600;
  color: #2d2d2d;
}

.history-list, .checkin-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.history-item, .checkin-item {
  display: flex;
  align-items: center;
  padding: 14px;
  background: linear-gradient(135deg, #fffaf5 0%, #fff8f0 100%);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.history-item:hover, .checkin-item:hover {
  background: linear-gradient(135deg, #fff5ee 0%, #fff0e6 100%);
}

.history-icon, .checkin-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  margin-right: 14px;
}

.history-icon {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  box-shadow: 0 2px 8px rgba(253, 203, 110, 0.3);
}

.checkin-icon {
  background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
  box-shadow: 0 2px 8px rgba(186, 156, 212, 0.3);
}

.history-info, .checkin-info {
  flex: 1;
}

.history-name, .checkin-name {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  color: #2d2d2d;
}

.history-time, .checkin-time {
  font-size: 13px;
  color: #888;
}

.current-badge {
  padding: 6px 14px;
  background: linear-gradient(135deg, #ff6b9d 0%, #c44569 100%);
  color: white;
  border-radius: 14px;
  font-size: 12px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.3);
}

.checkin-points {
  color: #ff6b9d;
  font-weight: 600;
  font-size: 15px;
}

.safety-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px;
  background: linear-gradient(135deg, #fff0f6 0%, #ffe4ec 100%);
  border-radius: 16px;
  margin-bottom: 80px;
  border: 1px solid #ffcce6;
}

.note-icon {
  font-size: 18px;
}

.note-text {
  font-size: 14px;
  color: #d32f2f;
  font-weight: 500;
}

.refresh-location-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 16px;
  background: white;
  border: 1px solid #ffd6e6;
  border-radius: 18px;
  font-size: 15px;
  color: #ff6b9d;
  font-weight: 500;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(255, 107, 157, 0.1);
}

.refresh-location-btn:hover:not(:disabled) {
  background: #fff5f8;
  border-color: #ff99bb;
  transform: translateY(-1px);
}

.refresh-location-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #ffe4ec;
  border-top: 2px solid #ff6b9d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.map-apps-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.map-app-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 8px;
  background: #fafafa;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.map-app-item:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.app-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.app-name {
  font-size: 12px;
  color: #666;
}
</style>
