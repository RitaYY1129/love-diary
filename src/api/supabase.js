const url = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '')
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const configured = () => {
  if (!url || !anonKey) {
    throw new Error('尚未配置 Supabase。请设置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY。')
  }
}

const request = async (path, options = {}, accessToken = null) => {
  configured()
  const response = await fetch(`${url}${path}`, {
    ...options,
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken || anonKey}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {})
    }
  })
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.msg || data?.message || data?.error_description || '请求失败')
  return data
}

const normalizeUsername = value => String(value || '').trim().toLowerCase()
const isPhone = value => /^1[3-9]\d{9}$/.test(value)
const isEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
const toHex = value => Array.from(new TextEncoder().encode(value), byte => byte.toString(16).padStart(2, '0')).join('')

// Supabase Auth uses email + password. Phone numbers and usernames are mapped to
// deterministic internal addresses, so neither needs an SMS service or public email.
export const authEmailFor = (identifier, username = '') => {
  const value = String(identifier || '').trim().toLowerCase()
  if (isEmail(value)) return value
  if (isPhone(value)) return `phone-${value}@love-diary.local`
  const name = normalizeUsername(username || value)
  if (!name) throw new Error('请输入用户名、邮箱或手机号')
  return `user-${toHex(name)}@love-diary.local`
}

export const supabaseAuth = {
  async signUp({ username, identifier, password }) {
    const email = authEmailFor(identifier, username)
    const data = await request('/auth/v1/signup', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        data: { username: normalizeUsername(username), identifier: String(identifier).trim() }
      })
    })
    if (!data.access_token) throw new Error('注册成功，但需要在 Supabase 中关闭“Confirm email”后才能直接登录。')
    return data
  },
  signIn(identifier, password) {
    return request('/auth/v1/token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email: authEmailFor(identifier), password })
    })
  },
  sendEmailCode(email) {
    return request('/auth/v1/otp', {
      method: 'POST',
      body: JSON.stringify({ email, should_create_user: true })
    })
  },
  verifyEmailCode(email, token) {
    return request('/auth/v1/verify', {
      method: 'POST',
      body: JSON.stringify({ email, token, type: 'email' })
    })
  },
  updateUser(accessToken, data) {
    return request('/auth/v1/user', { method: 'PUT', body: JSON.stringify(data) }, accessToken)
  },
  getUser(accessToken) {
    return request('/auth/v1/user', {}, accessToken)
  }
}

export const supabaseRest = {
  get(path, token) { return request(`/rest/v1/${path}`, {}, token) },
  post(path, body, token, headers = {}) {
    return request(`/rest/v1/${path}`, { method: 'POST', body: JSON.stringify(body), headers }, token)
  }
  ,patch(path, body, token) {
    return request(`/rest/v1/${path}`, { method: 'PATCH', body: JSON.stringify(body), headers: { Prefer: 'return=representation' } }, token)
  }
}

export const supabaseFunctions = {
  registerPhone: (payload) => request('/functions/v1/register-phone', { method: 'POST', body: JSON.stringify(payload) })
}
