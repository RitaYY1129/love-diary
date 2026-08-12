import axios from 'axios'
import { supabaseAuth, supabaseRest, supabaseFunctions } from './supabase'

// 开发环境使用同源代理，避免手机访问局域网地址时把 localhost 解析成手机自身。
// Android/生产构建仍由 VITE_API_BASE 指向正式 HTTPS 后端。
const API_BASE = import.meta.env.VITE_API_BASE || '/api'

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 10000
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('loveDiary_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('loveDiary_token')
      localStorage.removeItem('loveDiary_user')
      window.location.href = import.meta.env.BASE_URL || '/'
    }
    return Promise.reject(new Error(error.response?.data?.message || error.message))
  }
)

export const AuthAPI = {
  login: async (identifier, password) => {
    const session = await supabaseAuth.signIn(identifier, password)
    const user = await supabaseAuth.getUser(session.access_token)
    const profiles = await supabaseRest.get(`profiles?id=eq.${user.id}&select=*`, session.access_token)
    return { token: session.access_token, user: profiles[0] || user }
  },

  register: async (username, identifier, password) => {
    const session = await supabaseAuth.signUp({ username, identifier, password })
    const user = await supabaseAuth.getUser(session.access_token)
    const profiles = await supabaseRest.get(`profiles?id=eq.${user.id}&select=*`, session.access_token)
    return { token: session.access_token, user: profiles[0] || user }
  },

  sendEmailCode: async email => await supabaseAuth.sendEmailCode(email),

  registerByEmailCode: async (username, email, code, password) => {
    const session = await supabaseAuth.verifyEmailCode(email, code)
    const user = await supabaseAuth.updateUser(session.access_token, {
      password,
      data: { username: username.trim().toLowerCase(), identifier: email.trim().toLowerCase() }
    })
    const profiles = await supabaseRest.patch(
      `profiles?id=eq.${user.id}`,
      { username: username.trim().toLowerCase(), identifier: email.trim(), nickname: username.trim() },
      session.access_token
    )
    return { token: session.access_token, user: profiles[0] || user }
  },

  registerByPhone: async (username, phone, password) => {
    await supabaseFunctions.registerPhone({ username, phone, password })
    return await AuthAPI.login(phone, password)
  },

  loginByWechat: async (code) => {
    return await axiosInstance.post('/auth/wechat', { code })
  },

  getProfile: async () => {
    const token = localStorage.getItem('loveDiary_token')
    const user = await supabaseAuth.getUser(token)
    const profiles = await supabaseRest.get(`profiles?id=eq.${user.id}&select=*`, token)
    return { user: profiles[0] || user }
  },

  updateProfile: async (data) => {
    return await axiosInstance.put('/auth/profile', data)
  },

  bindPartner: async (partnerCode) => {
    const token = localStorage.getItem('loveDiary_token')
    const data = await supabaseRest.post('rpc/bind_partner', { partner_code: partnerCode }, token)
    return { partner: data }
  },

  unbindPartner: async () => {
    return await axiosInstance.post('/auth/partner/unbind')
  }
}

export const DiaryAPI = {
  list: async (page = 1, limit = 10) => {
    return await axiosInstance.get('/diaries', { params: { page, limit } })
  },

  get: async (id) => {
    return await axiosInstance.get(`/diaries/${id}`)
  },

  create: async (item) => {
    return await axiosInstance.post('/diaries', item)
  },

  update: async (id, item) => {
    return await axiosInstance.put(`/diaries/${id}`, item)
  },

  delete: async (id) => {
    return await axiosInstance.delete(`/diaries/${id}`)
  }
}

export const MoodAPI = {
  list: async () => {
    return await axiosInstance.get('/moods')
  },

  create: async (item) => {
    return await axiosInstance.post('/moods', item)
  },

  stats: async () => {
    return await axiosInstance.get('/moods/stats')
  }
}

export const CheckinAPI = {
  checkin: async () => {
    return await axiosInstance.post('/checkins')
  },

  getHistory: async () => {
    return await axiosInstance.get('/checkins/history')
  },

  getStats: async () => {
    return await axiosInstance.get('/checkins/stats')
  }
}

export const WishAPI = {
  list: async () => {
    return await axiosInstance.get('/wishes')
  },

  create: async (item) => {
    return await axiosInstance.post('/wishes', item)
  },

  update: async (id, item) => {
    return await axiosInstance.put(`/wishes/${id}`, item)
  },

  delete: async (id) => {
    return await axiosInstance.delete(`/wishes/${id}`)
  },

  complete: async (id) => {
    return await axiosInstance.post(`/wishes/${id}/complete`)
  }
}

export const AnniversaryAPI = {
  list: async () => {
    return await axiosInstance.get('/anniversaries')
  },

  create: async (item) => {
    return await axiosInstance.post('/anniversaries', item)
  },

  update: async (id, item) => {
    return await axiosInstance.put(`/anniversaries/${id}`, item)
  },

  delete: async (id) => {
    return await axiosInstance.delete(`/anniversaries/${id}`)
  }
}

export const PhotoAPI = {
  list: async () => {
    return await axiosInstance.get('/photos')
  },

  upload: async (item) => {
    return await axiosInstance.post('/photos', item)
  },

  update: async (id, item) => {
    return await axiosInstance.put(`/photos/${id}`, item)
  },

  delete: async (id) => {
    return await axiosInstance.delete(`/photos/${id}`)
  }
}

export const PlanAPI = {
  list: async () => {
    return await axiosInstance.get('/plans')
  },

  create: async (item) => {
    return await axiosInstance.post('/plans', item)
  },

  update: async (id, item) => {
    return await axiosInstance.put(`/plans/${id}`, item)
  },

  delete: async (id) => {
    return await axiosInstance.delete(`/plans/${id}`)
  },

  complete: async (id) => {
    return await axiosInstance.post(`/plans/${id}/complete`)
  }
}

export const LocationAPI = {
  get: async () => {
    return await axiosInstance.get('/locations')
  },

  update: async (item) => {
    return await axiosInstance.post('/locations', item)
  },

  getPartner: async () => {
    return await axiosInstance.get('/locations/partner')
  },

  getHistory: async () => {
    return await axiosInstance.get('/locations/history')
  }
}

export const CalmModeAPI = {
  get: async () => await axiosInstance.get('/calm-mode'),
  request: async (durationHours) => await axiosInstance.post('/calm-mode/request', { durationHours }),
  accept: async id => await axiosInstance.post(`/calm-mode/${id}/accept`),
  exit: async id => await axiosInstance.post(`/calm-mode/${id}/exit`)
}

export const ChatAPI = {
  list: async (afterId = 0) => await axiosInstance.get('/chat', { params: { afterId } }),
  send: async (type, content, metadata = {}) => await axiosInstance.post('/chat', { type, content, metadata })
}

export const CallAPI = {
  list: async (limit = 50) => await axiosInstance.get('/calls', { params: { limit } })
}

export const SharingAPI = {
  getPreferences: async () => ({ preferences: {} }),
  updatePreferences: async preferences => ({ preferences }),
  getState: async module => {
    const token = localStorage.getItem('loveDiary_token')
    const profile = await AuthAPI.getProfile()
    const coupleId = profile.user.couple_id || profile.user.id
    const rows = await supabaseRest.get(`couple_shared_states?couple_id=eq.${encodeURIComponent(coupleId)}&module_key=eq.${encodeURIComponent(module)}&select=payload`, token)
    return { payload: rows[0]?.payload ?? null }
  },
  putState: async (module, payload) => {
    const token = localStorage.getItem('loveDiary_token')
    const profile = await AuthAPI.getProfile()
    const coupleId = profile.user.couple_id || profile.user.id
    return supabaseRest.post('couple_shared_states?on_conflict=couple_id,module_key', {
      couple_id: coupleId, module_key: module, payload, updated_by: profile.user.id
    }, token, { Prefer: 'resolution=merge-duplicates,return=representation' })
  }
}
