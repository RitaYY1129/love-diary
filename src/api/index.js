import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'
const SMS_CODES_KEY = 'loveDiary_sms_codes'
const SMS_USERS_KEY = 'loveDiary_sms_users'

const readLocalObject = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}')
    return value && typeof value === 'object' && !Array.isArray(value) ? value : {}
  } catch {
    return {}
  }
}

const verifyLocalCode = (phone, code) => {
  const codes = readLocalObject(SMS_CODES_KEY)
  const record = codes[phone]

  if (!record || record.expiresAt < Date.now()) {
    if (record) {
      delete codes[phone]
      localStorage.setItem(SMS_CODES_KEY, JSON.stringify(codes))
    }
    throw new Error('验证码已过期，请重新获取')
  }

  if (String(record.code) !== String(code).trim()) {
    throw new Error('验证码错误，请重新输入')
  }

  delete codes[phone]
  localStorage.setItem(SMS_CODES_KEY, JSON.stringify(codes))
}

const getOrCreateSmsUser = (phone, profile = {}) => {
  const users = readLocalObject(SMS_USERS_KEY)
  const existing = users[phone]
  const user = {
    id: existing?.id || `sms_${phone}`,
    phone,
    nickname: profile.nickname || existing?.nickname || `恋爱用户${phone.slice(-4)}`,
    avatar: existing?.avatar || '',
    partner: existing?.partner || null,
    loveStartDate: existing?.loveStartDate || new Date().toISOString().slice(0, 10),
    createdAt: existing?.createdAt || new Date().toISOString()
  }
  users[phone] = user
  localStorage.setItem(SMS_USERS_KEY, JSON.stringify(users))
  return user
}

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
      window.location.href = '/'
    }
    return Promise.reject(error.response?.data?.message || error.message)
  }
)

export const AuthAPI = {
  login: async (phone, password) => {
    return await axiosInstance.post('/auth/login', { phone, password })
  },

  sendCode: async (phone) => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new Error('请输入正确的11位手机号')
    }

    const codes = readLocalObject(SMS_CODES_KEY)
    const code = String(Math.floor(100000 + Math.random() * 900000))
    codes[phone] = {
      code,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000
    }
    localStorage.setItem(SMS_CODES_KEY, JSON.stringify(codes))
    return { success: true, devCode: code, expiresIn: 300 }
  },

  loginByCode: async (phone, code) => {
    verifyLocalCode(phone, code)
    const user = getOrCreateSmsUser(phone)
    return {
      token: `sms_token_${phone}_${Date.now()}`,
      user
    }
  },

  register: async (phone, code, nickname, password) => {
    verifyLocalCode(phone, code)
    const user = getOrCreateSmsUser(phone, { nickname })
    return {
      token: `sms_token_${phone}_${Date.now()}`,
      user
    }
  },

  getProfile: async () => {
    return await axiosInstance.get('/auth/profile')
  },

  updateProfile: async (data) => {
    return await axiosInstance.put('/auth/profile', data)
  },

  bindPartner: async (partnerCode) => {
    return await axiosInstance.post('/auth/partner/bind', { partnerCode })
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
