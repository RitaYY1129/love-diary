// ============================================================================
//  统一 API 层 —— 全部走 Supabase 云后端（无需本地服务器，手机/网页直接可用）
//  底层使用 src/api/supabase.js 的 fetch 封装；页面调用方式保持不变。
// ============================================================================
import { supabaseRest, supabaseAuth, supabaseFunctions } from './supabase'

function currentUserId() {
  const raw = localStorage.getItem('loveDiary_user')
  if (!raw) return null
  try { return JSON.parse(raw).id || null } catch { return null }
}
function token() { return localStorage.getItem('loveDiary_token') }
function withOwner(p) { return { ...p, owner_id: currentUserId() } }

// ---------------------------------------------------------------------------
//  AuthAPI —— 委托 supabase.js
// ---------------------------------------------------------------------------
export const AuthAPI = {
  login: (identifier, password) => supabaseAuth.signIn(identifier, password),
  register: (payload) => supabaseAuth.signUp(payload),
  loginByWechat: (code) => supabaseAuth.signInWithWechat(code),
  getProfile: () => supabaseAuth.getProfile(),
  updateProfile: (payload) => supabaseAuth.updateProfile(payload),
  bindPartner: (inviteCode) => supabaseAuth.bindPartner(inviteCode),
  unbindPartner: () => supabaseAuth.unbindPartner()
}

// ---------------------------------------------------------------------------
//  通用 REST 表操作（PostgREST 查询参数风格）
// ---------------------------------------------------------------------------
function restApi(table, { idField = 'id' } = {}) {
  return {
    list: async (query = {}) => {
      let path = `${table}?select=*`
      if (query.eq) for (const [k, v] of Object.entries(query.eq)) path += `&${k}=eq.${encodeURIComponent(v)}`
      if (query.order) path += `&order=${query.order}.${query.ascending ? 'asc' : 'desc'}`
      else path += '&order=created_at.desc'
      if (query.limit) path += `&limit=${query.limit}`
      const data = await supabaseRest.get(path, token())
      return { data: data || [] }
    },
    get: async (id) => {
      const data = await supabaseRest.get(`${table}?select=*&${idField}=eq.${id}`, token())
      return Array.isArray(data) ? data[0] : data
    },
    create: async (item) => {
      const data = await supabaseRest.post(`${table}?select=*`, withOwner(item), token())
      return Array.isArray(data) ? data[0] : data
    },
    update: async (id, item) => {
      const data = await supabaseRest.patch(`${table}?${idField}=eq.${id}&select=*`, item, token())
      return Array.isArray(data) ? data[0] : data
    },
    delete: async (id) => {
      await supabaseRest.delete(`${table}?${idField}=eq.${id}`, token())
      return { success: true }
    }
  }
}

export const DiaryAPI = restApi('diaries')
export const WishAPI = {
  ...restApi('wishes'),
  complete: async (id) => {
    const data = await supabaseRest.patch(`wishes?id=eq.${id}&select=*`, { completed: true, completed_at: new Date().toISOString() }, token())
    return Array.isArray(data) ? data[0] : data
  }
}
export const PlanAPI = {
  ...restApi('plans'),
  complete: async (id) => {
    const data = await supabaseRest.patch(`plans?id=eq.${id}&select=*`, { completed: true, completed_at: new Date().toISOString() }, token())
    return Array.isArray(data) ? data[0] : data
  }
}

function mapAnniversaryOut(item) {
  return {
    name: item.name,
    date: item.date,
    type: item.type,
    custom_type: item.customType,
    count_mode: item.countMode,
    repeat_yearly: item.repeatYearly,
    pin_to_home: item.pinToHome
  }
}

function mapAnniversaryIn(row) {
  if (!row) return row
  return {
    ...row,
    customType: row.custom_type,
    countMode: row.count_mode,
    repeatYearly: row.repeat_yearly,
    pinToHome: row.pin_to_home
  }
}

export const AnniversaryAPI = {
  list: async (query = {}) => {
    const res = await restApi('anniversaries').list(query)
    return { data: (res.data || []).map(mapAnniversaryIn) }
  },
  get: async (id) => {
    const data = await supabaseRest.get(`anniversaries?select=*&id=eq.${id}`, token())
    return mapAnniversaryIn(Array.isArray(data) ? data[0] : data)
  },
  create: async (item) => {
    const data = await supabaseRest.post('anniversaries?select=*', withOwner(mapAnniversaryOut(item)), token())
    return mapAnniversaryIn(Array.isArray(data) ? data[0] : data)
  },
  update: async (id, item) => {
    const data = await supabaseRest.patch(`anniversaries?id=eq.${id}&select=*`, mapAnniversaryOut(item), token())
    return mapAnniversaryIn(Array.isArray(data) ? data[0] : data)
  },
  delete: async (id) => {
    await supabaseRest.delete(`anniversaries?id=eq.${id}`, token())
    return { success: true }
  },
  getPinned: async () => {
    const uid = currentUserId()
    const data = await supabaseRest.get(`anniversaries?select=*&owner_id=eq.${uid}&pin_to_home=eq.true&limit=1`, token())
    return mapAnniversaryIn(Array.isArray(data) && data[0] ? data[0] : null)
  },
  setPinned: async (id) => {
    const uid = currentUserId()
    await supabaseRest.patch(`anniversaries?owner_id=eq.${uid}&pin_to_home=eq.true`, { pin_to_home: false }, token())
    const data = await supabaseRest.patch(`anniversaries?id=eq.${id}&select=*`, { pin_to_home: true }, token())
    return mapAnniversaryIn(Array.isArray(data) ? data[0] : data)
  },
  unpin: async (id) => {
    const data = await supabaseRest.patch(`anniversaries?id=eq.${id}&select=*`, { pin_to_home: false }, token())
    return mapAnniversaryIn(Array.isArray(data) ? data[0] : data)
  }
}

export const PhotoAPI = restApi('photos')
export const MoodAPI = {
  list: async () => {
    const data = await supabaseRest.get('moods?select=*&order=created_at.desc', token())
    return { data: data || [] }
  },
  get: async (id) => {
    const data = await supabaseRest.get(`moods?select=*&id=eq.${id}`, token())
    return Array.isArray(data) ? data[0] : data
  },
  create: async (item) => {
    const data = await supabaseRest.post('moods?select=*', withOwner(item), token())
    return Array.isArray(data) ? data[0] : data
  },
  update: async (id, item) => {
    const data = await supabaseRest.patch(`moods?id=eq.${id}&select=*`, item, token())
    return Array.isArray(data) ? data[0] : data
  },
  delete: async (id) => {
    await supabaseRest.delete(`moods?id=eq.${id}`, token())
    return { success: true }
  },
  stats: async () => {
    const uid = currentUserId()
    const data = await supabaseRest.get(`moods?select=mood,emoji&owner_id=eq.${uid}`, token())
    const arr = data || []
    const moodScores = {
      happy: 5, love: 5, excited: 5,
      calm: 4,
      tired: 3, confused: 3,
      sad: 2, anxious: 2, lonely: 2,
      angry: 1
    }
    const scores = arr.map(m => moodScores[m.mood] || 3)
    const counts = {}
    for (const m of arr) {
      counts[m.mood] = (counts[m.mood] || 0) + 1
    }
    const topMood = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]
    const topEntry = topMood ? arr.find(m => m.mood === topMood[0]) : null
    return {
      count: arr.length,
      average: scores.length ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length * 10) / 10 : 0,
      topMood: topEntry ? { mood: topEntry.mood, emoji: topEntry.emoji } : null
    }
  }
}
export const CheckinAPI = {
  checkin: async () => {
    const uid = currentUserId()
    const today = new Date().toISOString().split('T')[0]
    const data = await supabaseRest.post(`checkins?select=*&on_conflict=owner_id,date`, { owner_id: uid, date: today }, token())
    return { success: true, data: Array.isArray(data) ? data[0] : data }
  },
  getHistory: async () => {
    const uid = currentUserId()
    const data = await supabaseRest.get(`checkins?select=date&owner_id=eq.${uid}`, token())
    return { data: (data || []).map(d => d.date) }
  },
  getStreak: async () => {
    const stats = await CheckinAPI.getStats()
    return { streak: stats.streak, total: stats.total }
  },
  getStats: async () => {
    const uid = currentUserId()
    const data = await supabaseRest.get(`checkins?select=date&owner_id=eq.${uid}`, token())
    const dates = (data || []).map(d => d.date).sort().reverse()
    let streak = 0
    const today = new Date()
    for (let i = 0; i < dates.length; i++) {
      const d = new Date(dates[i])
      const exp = new Date(today); exp.setDate(exp.getDate() - i)
      if (d.toDateString() === exp.toDateString()) streak++; else break
    }
    return { total: dates.length, streak, thisMonth: dates.filter(d => new Date(d).getMonth() === today.getMonth()).length }
  }
}
export const LocationAPI = {
  get: async () => {
    const uid = currentUserId()
    const data = await supabaseRest.get(`locations?select=*&owner_id=eq.${uid}&order=created_at.desc&limit=1`, token())
    return Array.isArray(data) ? data[0] : data
  },
  update: async (item) => {
    const data = await supabaseRest.post('locations?select=*', withOwner(item), token())
    return Array.isArray(data) ? data[0] : data
  },
  getPartner: async () => {
    const cid = await getMyCoupleId()
    if (!cid) return null
    const uid = currentUserId()
    const data = await supabaseRest.get(`locations?select=*&couple_id=eq.${cid}&owner_id=neq.${uid}&order=created_at.desc&limit=1`, token())
    return Array.isArray(data) ? data[0] : data
  },
  getHistory: async () => {
    const uid = currentUserId()
    const data = await supabaseRest.get(`locations?select=*&owner_id=eq.${uid}&order=created_at.desc`, token())
    return { data: data || [] }
  }
}
export const FinanceAPI = {
  list: async (page = 1, limit = 20) => {
    const from = (page - 1) * limit
    const data = await supabaseRest.get(`finances?select=*&order=happened_at.desc&limit=${limit}&offset=${from}`, token())
    return { data: data || [], total: data?.length || 0 }
  },
  create: async (item) => {
    const data = await supabaseRest.post('finances?select=*', withOwner(item), token())
    return Array.isArray(data) ? data[0] : data
  },
  update: async (id, item) => {
    const data = await supabaseRest.patch(`finances?id=eq.${id}&select=*`, item, token())
    return Array.isArray(data) ? data[0] : data
  },
  delete: async (id) => {
    await supabaseRest.delete(`finances?id=eq.${id}`, token())
    return { success: true }
  },
  getStats: async () => {
    const uid = currentUserId()
    const data = await supabaseRest.get(`finances?select=type,amount&owner_id=eq.${uid}`, token())
    let income = 0, expense = 0
    for (const r of data || []) {
      if (r.type === 'income') income += Number(r.amount)
      else expense += Number(r.amount)
    }
    return { income, expense, balance: income - expense }
  }
}

// ---------------------------------------------------------------------------
//  SharingAPI —— couple_shared_states（情侣共享状态双向同步）
// ---------------------------------------------------------------------------
export const SharingAPI = {
  getPreferences: async () => {
    const s = await SharingAPI.getState('preferences')
    return s.payload || {}
  },
  updatePreferences: async (preferences) => {
    const cur = (await SharingAPI.getState('preferences')).payload || {}
    return SharingAPI.putState('preferences', { ...cur, ...preferences })
  },
  getState: async (module) => {
    const cid = await getMyCoupleId()
    if (!cid) return { payload: null }
    const data = await supabaseRest.get(`couple_shared_states?select=state&couple_id=eq.${cid}&module=eq.${module}`, token())
    return { payload: Array.isArray(data) && data[0] ? data[0].state : null }
  },
  putState: async (module, payload) => {
    const cid = await getMyCoupleId()
    if (!cid) throw new Error('尚未绑定情侣')
    const data = await supabaseRest.post(`couple_shared_states?select=*&on_conflict=couple_id,module`, { couple_id: cid, module, state: payload }, token())
    return { payload: Array.isArray(data) ? data[0].state : payload }
  }
}

// ---------------------------------------------------------------------------
//  ChatAPI —— chat_messages（轮询拉取，无 realtime 依赖）
// ---------------------------------------------------------------------------
export const ChatAPI = {
  list: async (afterId = null) => {
    let path = 'chat_messages?select=*&order=created_at.asc'
    if (afterId) path += `&id=gt.${afterId}`
    const data = await supabaseRest.get(path, token())
    return { data: data || [] }
  },
  send: async (type, content, metadata = {}) => {
    const cid = await getMyCoupleId()
    if (!cid) throw new Error('尚未绑定情侣，无法聊天')
    const data = await supabaseRest.post('chat_messages?select=*', { couple_id: cid, sender_id: currentUserId(), type, content, metadata }, token())
    if (!data) throw new Error('消息发送失败：服务器未返回数据')
    return Array.isArray(data) ? data[0] : data
  },
  subscribe: (onInsert) => {
    // 降级为轮询：每秒拉取自增 id 之后的消息
    let lastId = null
    const timer = setInterval(async () => {
      try {
        const { data } = await ChatAPI.list(lastId)
        for (const m of data) {
          if (!lastId || m.id > lastId) { lastId = m.id; onInsert(m) }
        }
      } catch {}
    }, 1500)
    return () => clearInterval(timer)
  }
}

export const CallAPI = {
  list: async (limit = 50) => {
    const cid = await getMyCoupleId()
    if (!cid) return { data: [] }
    const data = await supabaseRest.get(`call_records?select=*&couple_id=eq.${cid}&order=created_at.desc&limit=${limit}`, token())
    return { data: data || [] }
  },
  record: async (calleeId, duration) => {
    const cid = await getMyCoupleId()
    const data = await supabaseRest.post('call_records?select=*', { couple_id: cid, caller_id: currentUserId(), callee_id: calleeId, duration }, token())
    return Array.isArray(data) ? data[0] : data
  }
}

export const CalmModeAPI = {
  get: async () => {
    const cid = await getMyCoupleId()
    if (!cid) return null
    const data = await supabaseRest.get(`calm_modes?select=*&couple_id=eq.${cid}&order=created_at.desc&limit=1`, token())
    return Array.isArray(data) ? data[0] : null
  },
  request: async (durationHours) => {
    const cid = await getMyCoupleId()
    const data = await supabaseRest.post('calm_modes?select=*', { couple_id: cid, requester_id: currentUserId(), duration_hours: durationHours, status: 'pending' }, token())
    return Array.isArray(data) ? data[0] : data
  },
  accept: async (id) => {
    const data = await supabaseRest.patch(`calm_modes?id=eq.${id}&select=*`, { status: 'active' }, token())
    return Array.isArray(data) ? data[0] : data
  },
  exit: async (id) => {
    const data = await supabaseRest.patch(`calm_modes?id=eq.${id}&select=*`, { status: 'ended' }, token())
    return Array.isArray(data) ? data[0] : data
  }
}

// 辅助：取当前用户 couple_id
async function getMyCoupleId() {
  const uid = currentUserId()
  if (!uid) return null
  const data = await supabaseRest.get(`profiles?select=couple_id&id=eq.${uid}`, token())
  return Array.isArray(data) && data[0] ? data[0].couple_id || null : null
}
