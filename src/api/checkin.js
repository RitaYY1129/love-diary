import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api'

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