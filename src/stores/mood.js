import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MoodAPI } from '@/api'
import { hydrateSharedState, pushSharedState } from '@/api/sharedState'

export const useMoodStore = defineStore('mood', () => {
  const moods = ref([])

  const list = async () => {
    try {
      const response = await MoodAPI.list()
      moods.value = response.data
      const shared = await hydrateSharedState('mood', moods.value)
      if (shared.enabled && Array.isArray(shared.payload)) {
        moods.value = shared.payload
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
      const today = new Date().toISOString().split('T')[0]
      const existingIndex = moods.value.findIndex(m => m.date === today)
      if (existingIndex !== -1) {
        moods.value[existingIndex] = response
      } else {
        moods.value.push(response)
      }
      pushSharedState('mood', moods.value)
      return response
    } catch (error) {
      console.error('Failed to create mood:', error)
      return null
    }
  }

  const update = async (id, data) => {
    try {
      const response = await MoodAPI.update(id, data)
      const index = moods.value.findIndex(m => m.id === id)
      if (index !== -1) {
        moods.value[index] = response
      }
      pushSharedState('mood', moods.value)
      return response
    } catch (error) {
      console.error('Failed to update mood:', error)
      return null
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
    return moods.value.find(m => m.date === today) || null
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
