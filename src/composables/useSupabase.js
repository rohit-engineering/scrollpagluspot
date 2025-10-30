// src/composables/useSupabase.js
import { createClient } from '@supabase/supabase-js'
import { ref, onMounted } from 'vue'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
export const supabase = createClient(supabaseUrl, supabaseKey)

export function useAuth() {
  const user = ref(null)        // Auth user
  const profile = ref(null)     // Profile data
  const loadingProfile = ref(false)

  // fetch profile asynchronously (non-blocking)
  const fetchProfile = async (id) => {
    loadingProfile.value = true
    const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
    if (!error) profile.value = data
    loadingProfile.value = false
    return { data, error }
  }

  // fast login: redirect immediately, fetch profile in background
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user

    // fetch profile concurrently in background
    if (data.user) fetchProfile(data.user.id)
    return data.user
  }

  // fast signup: create user, insert profile asynchronously
 const signup = async (email, password, full_name, phone) => {
  // ✅ Whitelisted real domains
  const allowedDomains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'protonmail.com'
  ]

  // ✅ Extract domain from email
  const domain = email.split('@')[1]?.toLowerCase()

  // 🚫 Block if domain not in whitelist
  if (!allowedDomains.includes(domain)) {
    throw new Error('⚠️ Please use a valid email domain (e.g., Gmail, Yahoo, Outlook).')
  }

  // 🕵️‍♂️ Check if email is disposable using API (Disify)
  try {
    const res = await fetch(`https://www.disify.com/api/email/${email}`)
    const data = await res.json()

    if (data.disposable) {
      throw new Error('🚫 Temporary or disposable email addresses are not allowed.')
    }
  } catch (err) {
    console.warn('⚠️ Email validation API failed, proceeding with domain-only check.')
  }

  // ✅ Proceed with Supabase signup if email passes checks
  const { data, error } = await supabase.auth.signUp({
    email,
    phone,
    password,
    options: {
      data: { full_name } // stored in raw_user_meta_data
    }
  })

  if (error) throw error

  user.value = data.user

  // ✅ Wait for profile trigger to complete then fetch profile
  if (data.user) {
    setTimeout(() => fetchProfile(data.user.id), 1500)
  }

  return data.user
}



  const logout = async () => {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  // reactive auth state listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    user.value = session?.user ?? null
    if (user.value) fetchProfile(user.value.id)  // background fetch
    else profile.value = null
  })

  // fetch session on mount
  onMounted(async () => {
    const s = await supabase.auth.getSession()
    user.value = s.data?.session?.user ?? null
    if (user.value) fetchProfile(user.value.id)
  })

  return { supabase, user, profile, loadingProfile, fetchProfile, login, signup, logout }
}
