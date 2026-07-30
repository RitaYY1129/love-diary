import axios from 'axios'

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
  login: async (phone, password) => {
    return await axiosInstance.post('/auth/login', { phone, password })
  },

  sendCode: async (phone, purpose = 'login') => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      throw new Error('请输入正确的11位手机号')
    }
    return await axiosInstance.post('/auth/sms/send', { phone, purpose })
  },

  loginByCode: async (phone, code) => {
    return await axiosInstance.post('/auth/sms/login', { phone, code })
  },

  register: async (phone, code, nickname, password) => {
    return await axiosInstance.post('/auth/sms/register', {
      phone,
      code,
      nickname,
      password
    })
  },

  loginByWechat: async (code) => {
    return await axiosInstance.post('/auth/wechat', { code })
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
  getPreferences: async () => await axiosInstance.get('/sharing/preferences'),
  updatePreferences: async preferences => await axiosInstance.put('/sharing/preferences', preferences),
  getState: async module => await axiosInstance.get(`/sharing/state/${module}`),
  putState: async (module, payload) => await axiosInstance.put(`/sharing/state/${module}`, { payload })
}
