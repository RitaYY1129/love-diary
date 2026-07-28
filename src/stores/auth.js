import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthAPI } from '@/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('loveDiary_token') || null)

  const isLoggedIn = computed(() => {
    return !!token.value && !!user.value
  })

  const saveSession = (response) => {
    token.value = response.token
    user.value = response.user
    localStorage.setItem('loveDiary_token', token.value)
    localStorage.setItem('loveDiary_user', JSON.stringify(user.value))
  }

  const login = async (phone, password) => {
    try {
      const response = await AuthAPI.login(phone, password)
      saveSession(response)
      return { ok: true, message: '登录成功' }
    } catch (error) {
      return { ok: false, message: error.message || '登录失败' }
    }
  }

  const loginByCode = async (phone, code) => {
    try {
      const response = await AuthAPI.loginByCode(phone, code)
      saveSession(response)
      return { ok: true, message: '验证码登录成功' }
    } catch (error) {
      return { ok: false, message: error.message || '登录失败' }
    }
  }

  const register = async (phone, code, nickname, password) => {
    try {
      const response = await AuthAPI.register(phone, code, nickname, password)
      saveSession(response)
      return { ok: true, message: '注册成功' }
    } catch (error) {
      return { ok: false, message: error.message || '注册失败' }
    }
  }

  const sendCode = async (phone) => {
    try {
      const response = await AuthAPI.sendCode(phone)
      return {
        ok: true,
        message: response.devCode
          ? `验证码：${response.devCode}，5分钟内有效`
          : '验证码已发送'
      }
    } catch (error) {
      return { ok: false, message: error.message || '发送失败' }
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('loveDiary_token')
    localStorage.removeItem('loveDiary_user')
  }

  const loadUser = async () => {
    if (token.value && !user.value) {
      const storedUser = localStorage.getItem('loveDiary_user')
      if (storedUser) {
        try {
          user.value = JSON.parse(storedUser)
        } catch (e) {
          console.error('Failed to parse stored user:', e)
        }
        return
      }
      
      try {
        const response = await AuthAPI.getProfile()
        user.value = response
        localStorage.setItem('loveDiary_user', JSON.stringify(response))
      } catch (error) {
        console.warn('Failed to load user from API:', error.message)
      }
    }
  }

  const bindPartner = async (partnerCode) => {
    try {
      const response = await AuthAPI.bindPartner(partnerCode)
      if (user.value) {
        user.value.partner = response.partner
      }
      return { ok: true, message: '绑定成功' }
    } catch (error) {
      return { ok: false, message: error.message || '绑定失败' }
    }
  }

  const bindVirtualPartner = () => {
    const virtualPartner = {
      id: '2',
      nickname: '虚拟情人',
      phone: '13800138001',
      createdAt: '2024-01-02T00:00:00Z'
    }
    
    if (user.value) {
      user.value.partner = virtualPartner
      localStorage.setItem('loveDiary_partner', JSON.stringify(virtualPartner))
      localStorage.setItem('loveDiary_user', JSON.stringify(user.value))
    }
    return { ok: true, message: '虚拟情人绑定成功' }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    loginByCode,
    register,
    sendCode,
    logout,
    loadUser,
    bindPartner,
    bindVirtualPartner
  }
})
