import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { initTheme } from './theme'

initTheme()
const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(error => {
      console.warn('Service worker registration failed:', error)
    })
  })
} else if (import.meta.env.DEV && 'serviceWorker' in navigator) {
  // 内部测试始终使用最新源码，避免旧 PWA 缓存让页面看得到但交互还是旧版本。
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => registration.unregister())
  })
}
