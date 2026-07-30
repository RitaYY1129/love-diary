<template>
  <div class="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="text-6xl mb-4">💕</div>
        <h1 class="text-2xl font-bold text-primary">恋爱日记</h1>
        <p class="text-gray-500 mt-2">记录你们的甜蜜时光</p>
      </div>

      <div class="card p-6">
        <div class="flex justify-center gap-4 mb-6">
          <button 
            @click="mode = 'login'" 
            :class="['px-6 py-2 rounded-lg font-medium transition-all', mode === 'login' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600']"
          >
            登录
          </button>
          <button 
            @click="mode = 'register'" 
            :class="['px-6 py-2 rounded-lg font-medium transition-all', mode === 'register' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600']"
          >
            注册
          </button>
        </div>

        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">手机号</label>
              <input 
                v-model="form.phone" 
                type="tel" 
                inputmode="numeric"
                autocomplete="tel"
                class="form-input" 
                placeholder="请输入手机号"
                maxlength="11"
              />
            </div>

            <div v-if="mode === 'login' && !loginWithCode">
              <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <input 
                v-model="form.password" 
                type="password" 
                class="form-input" 
                placeholder="请输入密码"
              />
            </div>

            <div v-else>
              <div class="flex gap-2">
                <div class="flex-1">
                  <label class="block text-sm font-medium text-gray-700 mb-2">验证码</label>
                  <input 
                    v-model="form.code" 
                    type="text" 
                    inputmode="numeric"
                    autocomplete="one-time-code"
                    class="form-input" 
                    placeholder="请输入验证码"
                    maxlength="6"
                  />
                </div>
                <div class="flex items-end">
                  <button 
                    type="button" 
                    @click="sendCode"
                    :disabled="codeButtonDisabled"
                    class="btn btn-outline h-[44px] px-4"
                  >
                    {{ codeButtonText }}
                  </button>
                </div>
              </div>
            </div>

            <div v-if="mode === 'register'">
              <label class="block text-sm font-medium text-gray-700 mb-2">昵称</label>
              <input 
                v-model="form.nickname" 
                type="text" 
                class="form-input" 
                placeholder="请输入昵称"
              />
            </div>

            <div v-if="mode === 'register'">
              <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <input 
                v-model="form.password" 
                type="password" 
                class="form-input" 
                placeholder="请输入密码"
              />
            </div>

            <div v-if="mode === 'login'" class="flex justify-between text-sm">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="rememberMe" />
                <span class="text-gray-600">记住我</span>
              </label>
              <button type="button" @click="loginWithCode = !loginWithCode" class="text-primary">
                {{ loginWithCode ? '使用密码登录' : '使用验证码登录' }}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-block mt-6"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '加载中...' : (mode === 'login' ? '登录' : '注册') }}
          </button>
        </form>

        <div v-if="mode === 'login'" class="flex items-center gap-3 my-5">
          <span class="h-px flex-1 bg-gray-200"></span>
          <span class="text-xs text-gray-400">其他登录方式</span>
          <span class="h-px flex-1 bg-gray-200"></span>
        </div>

        <button
          v-if="mode === 'login'"
          type="button"
          class="btn btn-block text-white bg-[#07c160] hover:bg-[#06ad56]"
          :disabled="isSubmitting"
          @click="handleWechatLogin"
        >
          <span class="mr-2 text-lg">微信</span>
          微信一键登录
        </button>

        <label class="mt-4 flex items-start justify-center gap-2 text-xs text-gray-500">
          <input v-model="agreedToTerms" type="checkbox" class="mt-0.5" />
          <span>我已阅读并同意《用户协议》和《隐私政策》</span>
        </label>

        <div class="mt-6 text-center">
          <button @click="showPartnerBind = true" class="text-primary text-sm">
            绑定另一半
          </button>
        </div>

      </div>
    </div>

    <div v-if="showPartnerBind" class="overlay show" @click.self="showPartnerBind = false">
      <div class="overlay-box p-6">
        <h3 class="text-lg font-bold mb-4">绑定另一半</h3>
        <p class="text-gray-500 text-sm mb-4">输入对方的邀请码进行绑定</p>
        <input 
          v-model="partnerCode" 
          type="text" 
          class="form-input mb-4" 
          placeholder="请输入邀请码"
        />
        <div class="flex gap-3 mb-3">
          <button @click="showPartnerBind = false" class="btn btn-secondary flex-1">取消</button>
          <button @click="bindPartner" class="btn btn-primary flex-1">绑定</button>
        </div>
        <button @click="bindVirtualPartner" class="btn btn-outline btn-block">
          👫 绑定虚拟情人 (测试)
        </button>
      </div>
    </div>

    <div :class="['toast', toast.show ? 'show' : '']">{{ toast.message }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

// 登录页空闲时先加载首页模块，避免首次登录后才现场编译页面。
onMounted(() => {
  import('@/views/Home.vue')
})

const mode = ref('login')
const loginWithCode = ref(true)
const rememberMe = ref(false)
const showPartnerBind = ref(false)
const partnerCode = ref('')
const isSubmitting = ref(false)
const agreedToTerms = ref(false)

const form = ref({
  phone: '',
  password: '',
  code: '',
  nickname: ''
})

const codeButtonText = ref('获取验证码')
const codeButtonDisabled = ref(false)
let codeTimer = null

const toast = ref({
  show: false,
  message: ''
})

const showToast = (message, duration = 2000) => {
  toast.value = { show: true, message }
  setTimeout(() => {
    toast.value.show = false
  }, duration)
}

const isValidPhone = (phone) => /^1[3-9]\d{9}$/.test(phone)

const sendCode = async () => {
  if (!isValidPhone(form.value.phone)) {
    showToast('请输入正确的11位手机号')
    return
  }
  
  codeButtonDisabled.value = true
  codeButtonText.value = '60s'
  
  const result = await authStore.sendCode(form.value.phone, mode.value)
  if (!result.ok) {
    showToast(result.message)
    codeButtonDisabled.value = false
    codeButtonText.value = '获取验证码'
    return
  }

  showToast(result.message, 6000)
  
  let count = 60
  codeTimer = setInterval(() => {
    count--
    if (count <= 0) {
      clearInterval(codeTimer)
      codeButtonDisabled.value = false
      codeButtonText.value = '获取验证码'
    } else {
      codeButtonText.value = `${count}s`
    }
  }, 1000)
}

const handleSubmit = async () => {
  if (!agreedToTerms.value) {
    showToast('请先阅读并同意用户协议和隐私政策')
    return
  }

  if (!isValidPhone(form.value.phone)) {
    showToast('请输入正确的11位手机号')
    return
  }
  
  if (mode.value === 'register') {
    if (!form.value.nickname) {
      showToast('请输入昵称')
      return
    }
    if (!form.value.password) {
      showToast('请输入密码')
      return
    }
    if (!form.value.code) {
      showToast('请输入验证码')
      return
    }
  } else {
    if (loginWithCode.value && !form.value.code) {
      showToast('请输入验证码')
      return
    }
    if (!loginWithCode.value && !form.value.password) {
      showToast('请输入密码')
      return
    }
  }
  
  isSubmitting.value = true
  
  let result
  if (mode.value === 'login') {
    if (loginWithCode.value) {
      result = await authStore.loginByCode(form.value.phone, form.value.code)
    } else {
      result = await authStore.login(form.value.phone, form.value.password)
    }
  } else {
    result = await authStore.register(form.value.phone, form.value.code, form.value.nickname, form.value.password)
  }
  
  isSubmitting.value = false
  
  if (result.ok) {
    await router.replace('/home')
  } else {
    showToast(result.message)
  }
}

const bindPartner = async () => {
  if (!partnerCode.value) {
    showToast('请输入邀请码')
    return
  }
  
  const result = await authStore.bindPartner(partnerCode.value)
  if (result.ok) {
    showToast(result.message)
    showPartnerBind.value = false
  } else {
    showToast(result.message)
  }
}

const bindVirtualPartner = () => {
  if (!authStore.isLoggedIn) {
    showToast('请先登录')
    return
  }
  
  const virtualPartner = {
    id: '2',
    nickname: '虚拟情人',
    phone: '13800138001',
    createdAt: '2024-01-02T00:00:00Z'
  }
  
  if (authStore.user) {
    authStore.user.partner = virtualPartner
    localStorage.setItem('loveDiary_partner', JSON.stringify(virtualPartner))
    showToast('虚拟情人绑定成功')
    showPartnerBind.value = false
  }
}

const handleWechatLogin = async () => {
  if (!agreedToTerms.value) {
    showToast('请先阅读并同意用户协议和隐私政策')
    return
  }

  isSubmitting.value = true
  const result = await authStore.loginByWechat()
  isSubmitting.value = false

  if (result.ok) {
    await router.replace('/home')
  } else {
    showToast(result.message, 3500)
  }
}

onBeforeUnmount(() => {
  if (codeTimer) clearInterval(codeTimer)
})
</script>
