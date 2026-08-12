// Deploy in Supabase Dashboard: Edge Functions -> Deploy a new function.
// The service-role key is supplied securely by Supabase at runtime.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'apikey, authorization, content-type' }

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (request.method !== 'POST') return new Response(JSON.stringify({ message: 'Method not allowed' }), { status: 405, headers: cors })
  try {
    const { username, phone, password } = await request.json()
    if (!String(username || '').trim() || !/^1[3-9]\d{9}$/.test(String(phone || '')) || String(password || '').length < 6) {
      throw new Error('请填写用户名、正确手机号和至少 6 位密码')
    }
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const email = `phone-${phone}@love-diary.local`
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { username: String(username).trim().toLowerCase(), identifier: String(phone) }
    })
    if (error) throw error
    return Response.json({ user: data.user }, { headers: cors })
  } catch (error) {
    return Response.json({ message: error.message || '注册失败' }, { status: 400, headers: cors })
  }
})
