import { defineStore } from 'pinia'
import { ref } from 'vue'
import { MockAPI } from '@/api/mock'

export const useDiaryStore = defineStore('diary', () => {
  const entries = ref([])

  const list = async () => {
    try {
      const response = await MockAPI.diary.list()
      entries.value = response.data
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