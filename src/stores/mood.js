import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MoodAPI } from '@/api'
import { hydrateSharedState, pushSharedState } from '@/api/sharedState'

const todayStr = () => new Date().toISOString().split('T')[0]

export const useMoodStore = defineStore('mood', () => {
  const moods = ref([])

  const normalizeMood = (m) => {
    if (!m) return m
    return { ...m, date: m.date || m.created_at?.slice(0, 10) }
  }

  const list = async () => {
    try {
      const response = await MoodAPI.list()
      moods.value = (response.data || []).map(normalizeMood)
      const shared = await hydrateSharedState('mood', moods.value)
      if (shared.enabled && Array.isArray(shared.payload)) {
        moods.value = shared.payload.map(normalizeMood)
        localStorage.setItem('loveDiary_moods', JSON.stringify(moods.value))
      }
      return moods.value
    } catch (error) {
      console.error('Failed to load moods:', error)
      return moods.value
    }
  }

  const create = async (data) => {
    try {
      const response = await MoodAPI.create(data)
      if (!response) throw new Error('创建心情失败')
      const item = normalizeMood(response)
      const today = todayStr()
      const existingIndex = moods.value.findIndex(m => (m.date || m.created_at?.slice(0, 10)) === today)
      if (existingIndex !== -1) {
        moods.value[existingIndex] = item
      } else {
        moods.value.unshift(item)
      }
      await pushSharedState('mood', moods.value)
      return item
    } catch (error) {
      console.error('Failed to create mood:', error)
      throw error
    }
  }

  const update = async (id, data) => {
    try {
      const response = await MoodAPI.update(id, data)
      if (!response) throw new Error('更新心情失败')
      const item = normalizeMood(response)
      const index = moods.value.findIndex(m => m.id === id)
      if (index !== -1) {
        moods.value[index] = item
      }
      await pushSharedState('mood', moods.value)
      return item
    } catch (error) {
      console.error('Failed to update mood:', error)
      throw error
    }
  }

  const deleteMood = async (id) => {
    try {
      await MoodAPI.delete(id)
      moods.value = moods.value.filter(m => m.id !== id)
      pushSharedState('mood', moods.value)
      return true
    } catch (error) {
      console.error('Failed to delete mood:', error)
      return false
    }
  }

  const stats = async () => {
    try {
      return await MoodAPI.stats()
    } catch (error) {
      console.error('Failed to get mood stats:', error)
      return null
    }
  }

  const getToday = () => {
    const today = new Date().toISOString().split('T')[0]
    return moods.value.find(m => (m.date || m.created_at?.slice(0, 10)) === today) || null
  }

  return {
    moods,
    list,
    create,
    update,
    delete: deleteMood,
    stats,
    getToday
  }
})
