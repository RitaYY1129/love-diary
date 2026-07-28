<template>
  <div class="home-page">
    <header class="home-header">
      <div>
        <p>{{ greeting }}</p>
        <h1>我们的恋爱空间</h1>
      </div>
      <button class="install-app-button" aria-label="安装恋爱日记" @click="installApp">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 17.5v1.2A2.3 2.3 0 0 0 7.3 21h9.4a2.3 2.3 0 0 0 2.3-2.3v-1.2" />
        </svg>
        <span>安装</span>
      </button>
    </header>

    <main class="home-main">
      <section class="love-hero">
        <div class="hero-glow hero-glow-one"></div>
        <div class="hero-glow hero-glow-two"></div>
        <span class="hero-doodle doodle-one">♡</span>
        <span class="hero-doodle doodle-two">✦</span>

        <div class="couple-row">
          <button class="avatar-button" @click="changeAvatar('user')">
            <img v-if="userAvatar" :src="userAvatar" alt="我的头像" />
            <span v-else>{{ userName.slice(0, 1) }}</span>
          </button>

          <div class="love-days">
            <span>我们在一起</span>
            <strong>{{ loveDays }}</strong>
            <em>天</em>
          </div>

          <button class="avatar-button" @click="changeAvatar('partner')">
            <img v-if="partnerAvatar" :src="partnerAvatar" alt="伴侣头像" />
            <span v-else>{{ partnerName.slice(0, 1) }}</span>
          </button>
        </div>

        <div class="couple-names">
          <span>{{ userName }}</span>
          <i>♥</i>
          <span>{{ partnerName }}</span>
        </div>

        <div class="hero-stats">
          <div>
            <strong>{{ loveValue }}</strong>
            <span>恋爱值</span>
          </div>
          <div>
            <strong>{{ diaryCount }}</strong>
            <span>篇日记</span>
          </div>
          <div>
            <strong>{{ memoryCount }}</strong>
            <span>份回忆</span>
          </div>
        </div>
      </section>

      <section class="checkin-card">
        <div class="checkin-icon">♥</div>
        <div class="checkin-copy">
          <strong>{{ checkedToday ? '今天也认真相爱了' : '记录今天的相爱' }}</strong>
          <span>已经连续陪伴 {{ streak }} 天</span>
        </div>
        <button :class="{ checked: checkedToday }" :disabled="checkingIn" @click="handleCheckin">
          {{ checkedToday ? '已打卡' : '甜蜜打卡' }}
        </button>
      </section>

      <div class="status-grid">
        <button class="status-card anniversary-status" @click="go('/anniversary')">
          <span class="status-kicker">下一纪念日</span>
          <strong>{{ nextAnniversary?.title || '添加一个重要日子' }}</strong>
          <span v-if="nextAnniversary" class="status-detail">
            还有 <b>{{ nextAnniversary.days }}</b> 天
          </span>
          <span v-else class="status-detail">把值得期待的日子记下来</span>
          <span class="status-art">♡</span>
        </button>

        <button class="status-card fund-status" @click="go('/fund')">
          <span class="status-kicker">共同记账</span>
          <strong>¥ {{ formatMoney(fundBalance) }}</strong>
          <span class="status-detail">{{ fundCount ? `已记录 ${fundCount} 笔` : '从第一笔共同开销开始' }}</span>
          <span class="status-art">¥</span>
        </button>
      </div>

      <section class="section-block">
        <div class="section-heading">
          <div>
            <span>QUICK ACCESS</span>
            <h2>快捷入口</h2>
          </div>
          <button @click="go('/me')">全部功能</button>
        </div>

        <div class="quick-grid">
          <button
            v-for="item in shortcuts"
            :key="item.path"
            class="quick-item"
            @click="go(item.path)"
          >
            <span class="quick-icon" :style="{ background: item.bg, color: item.color }" v-html="lineIcon(item.icon)"></span>
            <strong>{{ item.label }}</strong>
            <small>{{ item.desc }}</small>
          </button>
        </div>
      </section>

      <section class="section-block memory-section">
        <div class="section-heading">
          <div>
            <span>OUR MOMENTS</span>
            <h2>最近的浪漫</h2>
          </div>
          <button @click="go('/photo')">查看相册</button>
        </div>

        <button class="memory-collage" @click="go('/photo')">
          <div class="memory-main">
            <img :src="memoryCafe" alt="咖啡馆里的情侣回忆" />
            <span>把普通日子<br />过成喜欢的样子</span>
          </div>
          <div class="memory-side">
            <img :src="memoryMorning" alt="清晨的情侣回忆" />
            <div class="memory-note">
              <span>♥</span>
              <strong>{{ memoryCount || '0' }} 个瞬间</strong>
              <small>正在被好好收藏</small>
            </div>
          </div>
        </button>
      </section>

      <section class="section-block today-section">
        <div class="section-heading">
          <div>
            <span>JUST FOR US</span>
            <h2>今天的我们</h2>
          </div>
          <span class="today-date">{{ todayText }}</span>
        </div>

        <div class="today-feature" @click="go('/diary')">
          <div class="feature-icon">✎</div>
          <div class="feature-copy">
            <span>{{ recentDiary ? '最近一篇日记' : '今天还没有写日记' }}</span>
            <strong>{{ recentDiary?.title || '记下今天最想留住的一刻' }}</strong>
            <p>{{ recentDiary?.content || '哪怕只写一句话，也会成为以后的珍贵回忆。' }}</p>
          </div>
          <span class="feature-arrow">›</span>
        </div>

        <div class="today-list">
          <button @click="go('/plan')">
            <span class="list-icon plan-icon">✓</span>
            <span class="list-copy">
              <small>最近计划</small>
              <strong>{{ upcomingPlan?.title || '一起定个小目标' }}</strong>
            </span>
            <em>{{ upcomingPlan ? planDateText(upcomingPlan) : '去添加' }}</em>
          </button>

          <button @click="go('/wishes')">
            <span class="list-icon wish-icon">☆</span>
            <span class="list-copy">
              <small>心愿清单</small>
              <strong>{{ pendingWish?.title || '收藏下次想一起做的事' }}</strong>
            </span>
            <em>{{ pendingWish ? '待实现' : '去许愿' }}</em>
          </button>

          <button @click="go('/mood')">
            <span class="list-icon mood-icon">{{ todayMood?.emoji || '☺' }}</span>
            <span class="list-copy">
              <small>今日心情</small>
              <strong>{{ todayMoodLabel }}</strong>
            </span>
            <em>{{ todayMood ? '已记录' : '去记录' }}</em>
          </button>
        </div>
      </section>

      <section class="love-message">
        <span>“</span>
        <p>爱不是盛大的宣言，是每个普通日子里都有彼此。</p>
        <small>OUR LITTLE LOVE STORY</small>
      </section>
    </main>

    <nav class="bottom-nav">
      <button
        v-for="tab in tabs"
        :key="tab.path"
        :class="{ active: isTabActive(tab.path) }"
        @click="go(tab.path)"
      >
        <span v-html="lineIcon(tab.icon)"></span>
        <em>{{ tab.label }}</em>
      </button>
    </nav>

    <div v-if="toast" class="home-toast">{{ toast }}</div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCheckinStore } from '../stores/checkin'
import { useDiaryStore } from '../stores/diary'
import { useMoodStore } from '../stores/mood'
import { MockAPI } from '@/api/mock'
import memoryCafe from '../../assets/img/memory-cafe-web.jpg'
import memoryMorning from '../../assets/img/memory-morning-web.jpg'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const checkinStore = useCheckinStore()
const diaryStore = useDiaryStore()
const moodStore = useMoodStore()

const anniversaries = ref([])
const wishes = ref([])
const plans = ref([])
const fundData = ref({ totalAmount: 0, transactions: [] })
const photoRecords = ref([])
const checkingIn = ref(false)
const toast = ref('')
const installPrompt = ref(null)

const userName = computed(() => authStore.user?.nickname || authStore.user?.username || '我')
const partnerName = computed(() => authStore.user?.partner?.nickname || 'TA')
const userAvatar = computed(() => authStore.user?.avatar || '')
const partnerAvatar = computed(() => authStore.user?.partner?.avatar || '')
const loveStartDate = computed(() => authStore.user?.loveStartDate || '2023-05-20')

const loveDays = computed(() => {
  const start = parseDate(loveStartDate.value)
  return Math.max(1, Math.floor((startOfToday() - start) / 86400000) + 1)
})

const diaryCount = computed(() => diaryStore.entries?.length || 0)
const memoryCount = computed(() => photoRecords.value.reduce((total, record) => total + (record.photos?.length || 0), 0))
const loveValue = computed(() => {
  return 5200 + loveDays.value * 3 + diaryCount.value * 18 + checkinStore.history.length * 12
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 11) return '早上好，今天也要甜甜的'
  if (hour < 18) return '下午好，想念也有回音'
  return '晚上好，来看看我们的今天'
})

const todayText = computed(() => {
  return new Intl.DateTimeFormat('zh-CN', { month: 'long', day: 'numeric', weekday: 'short' }).format(new Date())
})

const checkedToday = computed(() => checkinStore.hasCheckedInToday)
const streak = computed(() => checkinStore.streak || 0)
const todayMood = computed(() => moodStore.getToday?.() || null)
const todayMoodLabel = computed(() => {
  if (!todayMood.value) return '你今天心情怎么样？'
  return todayMood.value.note || `今天的心情是 ${todayMood.value.score || 5} 分`
})
const recentDiary = computed(() => diaryStore.entries?.[0] || null)
const fundBalance = computed(() => Number(fundData.value.totalAmount) || 0)
const fundCount = computed(() => fundData.value.transactions?.length || 0)

const nextAnniversary = computed(() => {
  const items = anniversaries.value
    .map(item => ({ ...item, title: item.title || item.name, ...getNextOccurrence(item.date) }))
    .filter(item => Number.isFinite(item.days))
    .sort((a, b) => a.days - b.days)
  return items[0] || null
})

const upcomingPlan = computed(() => {
  return plans.value
    .filter(item => !item.completed && item.status !== 'completed')
    .sort((a, b) => String(a.target_date || a.date || '').localeCompare(String(b.target_date || b.date || '')))[0] || null
})

const pendingWish = computed(() => wishes.value.find(item => !item.completed && item.status !== 'completed') || null)

const shortcuts = [
  { label: '写日记', desc: '记录此刻', path: '/diary', icon: 'edit', bg: '#fff0f5', color: '#ee5f8b' },
  { label: '纪念日', desc: '重要日子', path: '/anniversary', icon: 'calendar', bg: '#fff1ee', color: '#f07869' },
  { label: '共同记账', desc: '每笔生活', path: '/fund', icon: 'wallet', bg: '#fff8e7', color: '#c9912e' },
  { label: '情侣相册', desc: '珍藏回忆', path: '/photo', icon: 'image', bg: '#eef8ff', color: '#438dbe' },
  { label: '愿望清单', desc: '一起实现', path: '/wishes', icon: 'star', bg: '#f3f0ff', color: '#8268cf' },
  { label: '未来计划', desc: '奔赴未来', path: '/plan', icon: 'flag', bg: '#edfaf4', color: '#4d9c78' },
  { label: '情侣互动', desc: '默契升温', path: '/games', icon: 'game', bg: '#fff1f7', color: '#dd6391' },
  { label: '悄悄话', desc: '说给你听', path: '/vent', icon: 'message', bg: '#eef5ff', color: '#5d82bd' }
]

const tabs = [
  { label: '我们', path: '/home', icon: 'home' },
  { label: '纪念日', path: '/anniversary', icon: 'calendar' },
  { label: '相册', path: '/photo', icon: 'image' },
  { label: '位置', path: '/location', icon: 'pin' },
  { label: '我的', path: '/me', icon: 'user' }
]

function parseDate(value) {
  const parts = String(value || '').slice(0, 10).split('-').map(Number)
  return new Date(parts[0] || 2023, (parts[1] || 1) - 1, parts[2] || 1)
}

function startOfToday() {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function getNextOccurrence(value) {
  if (!value) return { nextDate: null, days: Infinity }
  const original = parseDate(value)
  const today = startOfToday()
  let next = new Date(today.getFullYear(), original.getMonth(), original.getDate())
  if (next < today) next = new Date(today.getFullYear() + 1, original.getMonth(), original.getDate())
  return { nextDate: next, days: Math.ceil((next - today) / 86400000) }
}

function planDateText(plan) {
  const value = plan.target_date || plan.date
  if (!value) return '进行中'
  const date = parseDate(value)
  return `${date.getMonth() + 1}.${date.getDate()}`
}

function formatMoney(value) {
  return Math.abs(Number(value) || 0).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function go(path) {
  router.push(path)
}

function isTabActive(path) {
  return route.path === path || route.path.startsWith(`${path}/`)
}

function changeAvatar(target) {
  router.push({ path: '/settings', query: { avatar: target } })
}

function showToast(message, duration = 2600) {
  toast.value = message
  window.setTimeout(() => {
    if (toast.value === message) toast.value = ''
  }, duration)
}

function captureInstallPrompt(event) {
  event.preventDefault()
  installPrompt.value = event
}

async function installApp() {
  if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
    showToast('恋爱日记已经安装在手机上啦')
    return
  }

  if (installPrompt.value) {
    installPrompt.value.prompt()
    await installPrompt.value.userChoice
    installPrompt.value = null
    return
  }

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent)
  showToast(
    isIos
      ? '请点击 Safari 的分享按钮，再选择“添加到主屏幕”'
      : '请打开浏览器菜单，选择“安装应用”或“添加到主屏幕”',
    4200
  )
}

async function handleCheckin() {
  if (checkedToday.value || checkingIn.value) return
  checkingIn.value = true
  try {
    const result = await checkinStore.checkin()
    toast.value = result?.success === false ? (result.message || '今天已经打过卡啦') : '打卡成功，今天也要好好相爱'
  } catch {
    toast.value = '暂时没打上卡，再试一次吧'
  } finally {
    checkingIn.value = false
    window.setTimeout(() => { toast.value = '' }, 2200)
  }
}

function lineIcon(name) {
  const icons = {
    home: '<svg viewBox="0 0 24 24"><path d="M3.8 10.7 12 4l8.2 6.7v8a1.5 1.5 0 0 1-1.5 1.5H5.3a1.5 1.5 0 0 1-1.5-1.5z"/><path d="M9.2 20.2v-6.3h5.6v6.3"/></svg>',
    calendar: '<svg viewBox="0 0 24 24"><rect x="3.5" y="5.2" width="17" height="15.3" rx="2.2"/><path d="M7.8 3.5v3.4M16.2 3.5v3.4M3.5 9.3h17"/><path d="M8 13h.1M12 13h.1M16 13h.1M8 17h.1M12 17h.1"/></svg>',
    image: '<svg viewBox="0 0 24 24"><rect x="3.3" y="4.2" width="17.4" height="15.6" rx="2.3"/><circle cx="8.3" cy="9" r="1.7"/><path d="m4.4 17.7 4.8-4.6 3.2 2.8 2.6-2.5 4.6 4.3"/></svg>',
    pin: '<svg viewBox="0 0 24 24"><path d="M19.2 10c0 5.2-7.2 10.3-7.2 10.3S4.8 15.2 4.8 10a7.2 7.2 0 1 1 14.4 0Z"/><circle cx="12" cy="10" r="2.4"/></svg>',
    user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.1" r="3.6"/><path d="M5.4 20c.5-4 2.8-6 6.6-6s6.1 2 6.6 6"/></svg>',
    edit: '<svg viewBox="0 0 24 24"><path d="M4.2 19.8h4.1L19.2 8.9 15.1 4.8 4.2 15.7z"/><path d="m13.7 6.2 4.1 4.1M4 20h16"/></svg>',
    wallet: '<svg viewBox="0 0 24 24"><path d="M4 6.5h14.8a1.5 1.5 0 0 1 1.5 1.5v10.3a1.7 1.7 0 0 1-1.7 1.7H5.4a1.7 1.7 0 0 1-1.7-1.7V5.7A1.7 1.7 0 0 1 5.4 4h11"/><path d="M20.3 11.1h-5a2.1 2.1 0 0 0 0 4.2h5M15.4 13.2h.1"/></svg>',
    star: '<svg viewBox="0 0 24 24"><path d="m12 3.5 2.7 5.4 6 .9-4.4 4.2 1 6-5.3-2.8L6.7 20l1-6-4.4-4.2 6-.9z"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path d="M5.2 21V4.2M5.5 5h12.8l-2.6 3.6 2.6 3.6H5.5"/></svg>',
    game: '<svg viewBox="0 0 24 24"><path d="M8 8.2h8a5.5 5.5 0 0 1 5.2 7.3l-.7 2a2.6 2.6 0 0 1-4.3 1l-1.7-1.7h-5l-1.7 1.7a2.6 2.6 0 0 1-4.3-1l-.7-2A5.5 5.5 0 0 1 8 8.2Z"/><path d="M7.5 11.5v4M5.5 13.5h4M16.3 12.5h.1M18.3 14.5h.1"/></svg>',
    message: '<svg viewBox="0 0 24 24"><path d="M20.2 11.2a8 8 0 0 1-8.4 8 9.5 9.5 0 0 1-3.5-.7L4 20l1.3-4a8 8 0 1 1 14.9-4.8Z"/><path d="M8 11.5h.1M12 11.5h.1M16 11.5h.1"/></svg>'
  }
  return icons[name] || icons.home
}

onMounted(async () => {
  window.addEventListener('beforeinstallprompt', captureInstallPrompt)
  window.addEventListener('appinstalled', () => showToast('安装成功，去手机桌面看看吧'))

  const readLocal = key => {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]')
      return Array.isArray(value) ? value : []
    } catch {
      return []
    }
  }

  try {
    const savedFund = JSON.parse(localStorage.getItem('loveDiary_fund') || '{}')
    fundData.value = {
      totalAmount: Number(savedFund.totalAmount) || 0,
      transactions: Array.isArray(savedFund.transactions) ? savedFund.transactions : []
    }
  } catch {
    fundData.value = { totalAmount: 0, transactions: [] }
  }
  photoRecords.value = readLocal('loveDiary_photoRecords')

  const tasks = [
    moodStore.list?.(),
    diaryStore.list?.(),
    checkinStore.loadHistory?.(),
    checkinStore.loadStreak?.(),
    MockAPI.anniversary.list(),
    MockAPI.wish.list(),
    MockAPI.plan.list()
  ]

  const results = await Promise.allSettled(tasks)
  if (results[4]?.status === 'fulfilled') anniversaries.value = results[4].value?.data || []
  if (results[5]?.status === 'fulfilled') wishes.value = results[5].value?.data || []
  if (results[6]?.status === 'fulfilled') plans.value = results[6].value?.data || []
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', captureInstallPrompt)
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: 92px;
  color: #49373e;
  background:
    radial-gradient(circle at 8% 8%, rgba(255, 226, 235, .66), transparent 24%),
    linear-gradient(180deg, #fff9fb 0, #fffdfc 420px, #fffaf8 100%);
}

button {
  font: inherit;
}

.home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 620px;
  margin: 0 auto;
  padding: 24px 20px 14px;
}

.home-header p {
  margin: 0 0 3px;
  color: #a98f98;
  font-size: 12px;
}

.home-header h1 {
  margin: 0;
  color: #39272e;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 21px;
  letter-spacing: .02em;
}

.install-app-button {
  display: flex;
  align-items: center;
  height: 40px;
  padding: 0 13px;
  border: 1px solid rgba(230, 112, 148, .16);
  border-radius: 16px;
  color: #e56b92;
  background: rgba(255, 255, 255, .88);
  box-shadow: 0 8px 22px rgba(169, 96, 118, .09);
  gap: 5px;
  font-size: 11px;
  font-weight: 650;
}

.install-app-button svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.home-main {
  display: grid;
  max-width: 620px;
  margin: 0 auto;
  padding: 0 16px 34px;
  gap: 14px;
}

.love-hero {
  position: relative;
  overflow: hidden;
  min-height: 260px;
  padding: 27px 22px 18px;
  border-radius: 30px;
  color: #fff;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, .15), transparent 38%),
    linear-gradient(135deg, #f38aa9 0%, #ef6f99 48%, #e95d8d 100%);
  box-shadow: 0 20px 48px rgba(213, 79, 123, .23);
}

.hero-glow {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, .14);
}

.hero-glow-one {
  top: -75px;
  right: -48px;
  width: 210px;
  height: 210px;
}

.hero-glow-two {
  bottom: -85px;
  left: -45px;
  width: 180px;
  height: 180px;
}

.hero-doodle {
  position: absolute;
  z-index: 1;
  color: rgba(255, 255, 255, .65);
  font-size: 24px;
}

.doodle-one {
  top: 25px;
  left: 34px;
  transform: rotate(-18deg);
}

.doodle-two {
  top: 40px;
  right: 35px;
}

.couple-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}

.avatar-button {
  display: grid;
  overflow: hidden;
  width: 68px;
  height: 68px;
  padding: 0;
  border: 3px solid rgba(255, 255, 255, .8);
  border-radius: 50%;
  color: #e76590;
  background: #fff4f7;
  box-shadow: 0 8px 22px rgba(135, 36, 69, .16);
  place-items: center;
  font-size: 22px;
  font-weight: 700;
}

.avatar-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.love-days {
  min-width: 108px;
  text-align: center;
}

.love-days span {
  display: block;
  margin-bottom: 2px;
  font-size: 11px;
  opacity: .83;
}

.love-days strong {
  font-family: Georgia, serif;
  font-size: 43px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: -.04em;
}

.love-days em {
  margin-left: 4px;
  font-size: 12px;
  font-style: normal;
}

.couple-names {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
  gap: 9px;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 15px;
}

.couple-names i {
  font-size: 11px;
  font-style: normal;
  opacity: .72;
}

.hero-stats {
  position: absolute;
  right: 17px;
  bottom: 16px;
  left: 17px;
  z-index: 2;
  display: grid;
  padding: 13px 8px;
  border: 1px solid rgba(255, 255, 255, .2);
  border-radius: 18px;
  grid-template-columns: repeat(3, 1fr);
  background: rgba(122, 31, 65, .13);
  backdrop-filter: blur(12px);
}

.hero-stats div {
  display: grid;
  text-align: center;
  gap: 2px;
}

.hero-stats div + div {
  border-left: 1px solid rgba(255, 255, 255, .2);
}

.hero-stats strong {
  font-size: 16px;
}

.hero-stats span {
  font-size: 10px;
  opacity: .78;
}

.checkin-card {
  display: flex;
  align-items: center;
  min-height: 76px;
  padding: 12px 13px;
  border: 1px solid #f8e8df;
  border-radius: 22px;
  background: linear-gradient(100deg, #fffaf2, #fff5f7);
  box-shadow: 0 10px 30px rgba(125, 80, 71, .07);
}

.checkin-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 15px;
  color: #e76f94;
  background: #ffe6ef;
  place-items: center;
}

.checkin-copy {
  display: grid;
  min-width: 0;
  margin: 0 auto 0 11px;
  gap: 3px;
}

.checkin-copy strong {
  color: #51383f;
  font-size: 14px;
}

.checkin-copy span {
  color: #a0888f;
  font-size: 11px;
}

.checkin-card button {
  padding: 10px 14px;
  border: 0;
  border-radius: 15px;
  color: #fff;
  background: linear-gradient(135deg, #ef7b9e, #e45d8b);
  box-shadow: 0 7px 16px rgba(219, 77, 122, .2);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.checkin-card button.checked {
  color: #ad8793;
  background: #f3e6ea;
  box-shadow: none;
}

.status-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.status-card {
  position: relative;
  overflow: hidden;
  min-height: 124px;
  padding: 17px;
  border: 0;
  border-radius: 23px;
  text-align: left;
}

.anniversary-status {
  color: #67526f;
  background: linear-gradient(145deg, #f4efff, #eee8ff);
}

.fund-status {
  color: #705a3e;
  background: linear-gradient(145deg, #fff5dc, #fff0ca);
}

.status-kicker {
  display: block;
  margin-bottom: 8px;
  font-size: 10px;
  letter-spacing: .08em;
  opacity: .68;
}

.status-card strong {
  display: block;
  overflow: hidden;
  max-width: 84%;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 15px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-detail {
  display: block;
  margin-top: 14px;
  font-size: 10px;
  opacity: .72;
}

.status-detail b {
  margin: 0 2px;
  color: #e3628c;
  font-size: 18px;
}

.status-art {
  position: absolute;
  right: 13px;
  bottom: 6px;
  color: rgba(255, 255, 255, .66);
  font-family: Georgia, serif;
  font-size: 48px;
  transform: rotate(-10deg);
}

.section-block {
  padding: 20px 17px;
  border: 1px solid rgba(225, 189, 199, .25);
  border-radius: 27px;
  background: rgba(255, 255, 255, .9);
  box-shadow: 0 13px 36px rgba(108, 69, 80, .075);
}

.section-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-heading span {
  display: block;
  margin-bottom: 3px;
  color: #d69aab;
  font-size: 8px;
  letter-spacing: .17em;
}

.section-heading h2 {
  margin: 0;
  color: #49343b;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 18px;
  font-weight: 700;
}

.section-heading button {
  padding: 5px;
  border: 0;
  color: #b79ba3;
  background: transparent;
  font-size: 11px;
}

.section-heading .today-date {
  margin: 0 2px 2px 0;
  color: #ac969d;
  font-size: 10px;
  letter-spacing: 0;
}

.quick-grid {
  display: grid;
  row-gap: 20px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.quick-item {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 0;
  border: 0;
  color: #59464c;
  background: transparent;
  flex-direction: column;
}

.quick-icon {
  display: grid;
  width: 47px;
  height: 47px;
  margin-bottom: 8px;
  border-radius: 16px;
  place-items: center;
}

.quick-icon :deep(svg) {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.65;
}

.quick-item strong {
  font-size: 11px;
  font-weight: 650;
  white-space: nowrap;
}

.quick-item small {
  margin-top: 2px;
  color: #b7a4aa;
  font-size: 8px;
  white-space: nowrap;
}

.memory-collage {
  display: grid;
  overflow: hidden;
  width: 100%;
  height: 238px;
  padding: 0;
  border: 0;
  border-radius: 21px;
  grid-template-columns: 1.45fr 1fr;
  gap: 4px;
  background: #f5e9ec;
}

.memory-main,
.memory-side {
  position: relative;
  overflow: hidden;
}

.memory-main img,
.memory-side img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.memory-main::after {
  position: absolute;
  inset: 45% 0 0;
  content: "";
  background: linear-gradient(transparent, rgba(49, 27, 35, .58));
}

.memory-main span {
  position: absolute;
  bottom: 18px;
  left: 17px;
  z-index: 2;
  color: #fff;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 15px;
  line-height: 1.65;
  text-align: left;
  text-shadow: 0 2px 12px rgba(0, 0, 0, .25);
}

.memory-side {
  display: grid;
  grid-template-rows: 1.15fr .85fr;
  gap: 4px;
}

.memory-note {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c6672;
  background: #fbedf1;
  flex-direction: column;
}

.memory-note > span {
  margin-bottom: 5px;
  color: #df6e91;
  font-size: 15px;
}

.memory-note strong {
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 12px;
}

.memory-note small {
  margin-top: 3px;
  font-size: 8px;
  opacity: .65;
}

.today-feature {
  display: flex;
  align-items: center;
  padding: 14px;
  border: 1px solid #f2e8e7;
  border-radius: 19px;
  background: #fffaf8;
  cursor: pointer;
}

.feature-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 14px;
  color: #c67582;
  background: #fceced;
  place-items: center;
  font-family: Georgia, serif;
  font-size: 22px;
}

.feature-copy {
  min-width: 0;
  margin-left: 11px;
}

.feature-copy > span {
  color: #b49da4;
  font-size: 9px;
}

.feature-copy strong {
  display: block;
  overflow: hidden;
  margin-top: 2px;
  color: #5c454c;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-copy p {
  display: -webkit-box;
  overflow: hidden;
  margin: 4px 0 0;
  color: #a38f95;
  font-size: 9px;
  line-height: 1.5;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.feature-arrow {
  margin-left: auto;
  padding-left: 9px;
  color: #c9b4ba;
  font-size: 24px;
}

.today-list {
  display: grid;
  margin-top: 8px;
}

.today-list button {
  display: flex;
  align-items: center;
  min-width: 0;
  padding: 13px 4px;
  border: 0;
  border-bottom: 1px solid #f5edef;
  text-align: left;
  background: transparent;
}

.today-list button:last-child {
  border-bottom: 0;
  padding-bottom: 3px;
}

.list-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 11px;
  place-items: center;
  font-size: 14px;
}

.plan-icon {
  color: #5c9d7d;
  background: #ecf8f2;
}

.wish-icon {
  color: #8a6fca;
  background: #f2effb;
}

.mood-icon {
  color: #d3894b;
  background: #fff3e6;
}

.list-copy {
  display: grid;
  overflow: hidden;
  margin-left: 10px;
  gap: 2px;
}

.list-copy small {
  color: #b5a0a6;
  font-size: 8px;
}

.list-copy strong {
  overflow: hidden;
  color: #604a51;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.today-list em {
  margin-left: auto;
  padding-left: 10px;
  color: #c5b2b8;
  font-size: 9px;
  font-style: normal;
  white-space: nowrap;
}

.love-message {
  padding: 22px 24px;
  border-radius: 25px;
  text-align: center;
  background: linear-gradient(135deg, #fcedf1, #fff6ef);
}

.love-message > span {
  display: block;
  height: 21px;
  color: #d8899e;
  font-family: Georgia, serif;
  font-size: 34px;
  line-height: 1;
}

.love-message p {
  margin: 5px 0 9px;
  color: #795d65;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 12px;
  line-height: 1.75;
}

.love-message small {
  color: #c49fa9;
  font-size: 7px;
  letter-spacing: .17em;
}

.bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 20;
  display: grid;
  max-width: 620px;
  height: 72px;
  margin: 0 auto;
  padding: 8px 12px 6px;
  border: 1px solid rgba(223, 190, 199, .44);
  border-bottom: 0;
  border-radius: 25px 25px 0 0;
  grid-template-columns: repeat(5, 1fr);
  background: rgba(255, 253, 253, .94);
  box-shadow: 0 -8px 30px rgba(91, 55, 65, .09);
  backdrop-filter: blur(16px);
}

.bottom-nav button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  color: #b5a4aa;
  background: transparent;
  flex-direction: column;
  gap: 4px;
}

.bottom-nav button > span {
  display: grid;
  width: 29px;
  height: 29px;
  border-radius: 11px;
  place-items: center;
}

.bottom-nav :deep(svg) {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.6;
}

.bottom-nav em {
  font-size: 9px;
  font-style: normal;
}

.bottom-nav button.active {
  color: #e25f8a;
}

.bottom-nav button.active > span {
  background: #ffe9f0;
}

.home-toast {
  position: fixed;
  bottom: 91px;
  left: 50%;
  z-index: 40;
  max-width: 84vw;
  padding: 11px 18px;
  border-radius: 18px;
  color: #fff;
  background: rgba(68, 43, 51, .9);
  box-shadow: 0 8px 24px rgba(61, 35, 44, .2);
  font-size: 12px;
  transform: translateX(-50%);
}

@media (min-width: 700px) {
  .home-page {
    padding-top: 8px;
  }

  .love-hero {
    min-height: 280px;
  }

  .quick-icon {
    width: 52px;
    height: 52px;
  }
}

@media (max-width: 370px) {
  .home-main {
    padding-right: 12px;
    padding-left: 12px;
  }

  .love-hero {
    padding-right: 14px;
    padding-left: 14px;
  }

  .couple-row {
    gap: 12px;
  }

  .avatar-button {
    width: 60px;
    height: 60px;
  }

  .quick-item small {
    display: none;
  }

  .status-card {
    padding: 14px;
  }
}
</style>
