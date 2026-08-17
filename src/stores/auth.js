import { defineStore } from 'pinia'
import { AuthAPI } from '@/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false
  }),

  getters: {
    currentUser: (state) => state.user,
    partner: (state) => state.user?.partner || null,
    isLoggedIn: (state) => state.isAuthenticated && !!state.token
  },

  actions: {
    // ---- 初始化：从本地恢复会话 ----
    init() {
      const token = localStorage.getItem('loveDiary_token')
      const userRaw = localStorage.getItem('loveDiary_user')
      if (token && userRaw) {
        try {
          this.token = token
          this.user = JSON.parse(userRaw)
          this.isAuthenticated = true
        } catch (e) {
          this.logout()
        }
      }
    },

    _persist(token, user) {
      this.token = token
      this.user = user
      this.isAuthenticated = true
      localStorage.setItem('loveDiary_token', token)
      localStorage.setItem('loveDiary_user', JSON.stringify(user))
    },

    // ---- 登录 ----
    async login(identifier, password) {
      const result = await AuthAPI.login(identifier, password)
      if (result.ok) {
        this._persist(result.token, result.user)
        return { ok: true }
      }
      return { ok: false, message: result.message }
    },

    // ---- 注册 ----
    async register(payload) {
      const result = await AuthAPI.register(payload)
      if (result.ok) {
        // 注册后若直接返回会话则登录，否则提示去登录
        if (result.token && result.user) {
          this._persist(result.token, result.user)
        }
        return { ok: true, needLogin: !result.token, message: result.message }
      }
      return { ok: false, message: result.message }
    },

    // ---- 微信登录 ----
    async loginByWechat(code) {
      const result = await AuthAPI.loginByWechat(code)
      if (result.ok) {
        this._persist(result.token, result.user)
        return { ok: true }
      }
      return { ok: false, message: result.message }
    },

    // ---- 获取最新资料（含 partner）----
    async loadUser() {
      if (!this.token) return
      try {
        const result = await AuthAPI.getProfile()
        if (result.ok) {
          this.user = result.user
          localStorage.setItem('loveDiary_user', JSON.stringify(result.user))
        }
      } catch (e) {
        // 失败不阻塞页面
        console.warn('loadUser 失败:', e.message)
      }
    },

    // ---- 更新资料 ----
    async updateProfile(payload) {
      const result = await AuthAPI.updateProfile(payload)
      if (result.ok) {
        this.user = result.user
        localStorage.setItem('loveDiary_user', JSON.stringify(result.user))
        return { ok: true }
      }
      return { ok: false, message: result.message }
    },

    // ---- 绑定情侣 ----
    async bindPartner(inviteCode) {
      const result = await AuthAPI.bindPartner(inviteCode)
      if (result.ok) {
        // 重新拉取资料以更新 partner / couple_id
        await this.loadUser()
        return { ok: true, message: result.message }
      }
      return { ok: false, message: result.message }
    },

    async unbindPartner() {
      const result = await AuthAPI.unbindPartner()
      if (result.ok) {
        await this.loadUser()
        return { ok: true }
      }
      return { ok: false, message: result.message }
    },

    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      localStorage.removeItem('loveDiary_token')
      localStorage.removeItem('loveDiary_user')
    }
  }
})
