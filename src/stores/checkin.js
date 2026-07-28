import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MockAPI } from '@/api/mock'

export const useCheckinStore = defineStore('checkin', () => {
  const history = ref([])
  const streak = ref(0)

  const checkin = async () => {
    try {
      const response = await MockAPI.checkin.checkin()
      if (response.success) {
        const today = new Date().toISOString().split('T')[0]
        if (!history.value.includes(today)) {
          history.value.push(today)
        }
        streak.value = response.streak
      }
      return response
    } catch (error) {
      console.error('Checkin failed:', error)
      return { success: false }
    }
  }

  const loadHistory = async () => {
    try {
      const response = await MockAPI.checkin.getHistory()
      history.value = response.data
      return history.value
    } catch (error) {
      console.error('Failed to load checkin history:', error)
      return history.value
    }
  }

  const loadStreak = async () => {
    try {
      const response = await MockAPI.checkin.getStreak()
      streak.value = response.streak
      return streak.value
    } catch (error) {
      console.error('Failed to load streak:', error)
      return streak.value
    }
  }

  const getStats = async () => {
    try {
      return await MockAPI.checkin.getStats()
    } catch (error) {
      console.error('Failed to get checkin stats:', error)
      return null
    }
  }

  const hasCheckedInToday = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return history.value.includes(today)
  })

  const totalCheckins = computed(() => history.value.length)

  return {
    history,
    streak,
    hasCheckedInToday,
    totalCheckins,
    checkin,
    loadHistory,
    loadStreak,
    getStats
  }
})