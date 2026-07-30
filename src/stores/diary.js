import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MockAPI } from '@/api/mock'
import { hydrateSharedState, pushSharedState } from '@/api/sharedState'

export const useDiaryStore = defineStore('diary', () => {
  const entries = ref([])

  const list = async () => {
    try {
      const response = await MockAPI.diary.list()
      entries.value = response.data
      const shared = await hydrateSharedState('diary', entries.value)
      if (shared.enabled && Array.isArray(shared.payload)) {
        entries.value = shared.payload
        localStorage.setItem('loveDiary_diaries', JSON.stringify(entries.value))
      }
      return entries.value
    } catch (error) {
      console.error('Failed to load diary entries:', error)
      return entries.value
    }
  }

  const get = async (id) => {
    try {
      return await MockAPI.diary.get(id)
    } catch (error) {
      console.error('Failed to get diary entry:', error)
      return null
    }
  }

  const create = async (data) => {
    try {
      const response = await MockAPI.diary.create(data)
      entries.value.unshift(response)
      pushSharedState('diary', entries.value)
      return response
    } catch (error) {
      console.error('Failed to create diary entry:', error)
      return null
    }
  }

  const update = async (id, data) => {
    try {
      const response = await MockAPI.diary.update(id, data)
      const index = entries.value.findIndex(e => e.id === id)
      if (index !== -1) {
        entries.value[index] = response
      }
      pushSharedState('diary', entries.value)
      return response
    } catch (error) {
      console.error('Failed to update diary entry:', error)
      return null
    }
  }

  const deleteEntry = async (id) => {
    try {
      await MockAPI.diary.delete(id)
      entries.value = entries.value.filter(e => e.id !== id)
      pushSharedState('diary', entries.value)
      return true
    } catch (error) {
      console.error('Failed to delete diary entry:', error)
      return false
    }
  }

  return {
    entries,
    list,
    get,
    create,
    update,
    delete: deleteEntry
  }
})
