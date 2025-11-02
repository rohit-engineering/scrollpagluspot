<template>
  <div class="notif-page">
    <h2 class="page-title">✨ Notifications Feed ✨</h2>

    <!-- Connection Status -->
    <div class="connection-status">
      <span v-if="connectionStatus === 'connected'" class="status success">🟢 Connected</span>
      <span v-else-if="connectionStatus === 'error'" class="status error">🔴 Connection Failed</span>
      <span v-else class="status loading">🌀 Checking...</span>
    </div>

    <!-- Toast -->
    <transition name="toast-fade">
      <div v-if="showToast" class="toast">✨ New post added!</div>
    </transition>

    <!-- Loading -->
    <div v-if="loading" class="loading-state">Loading notifications...</div>

    <!-- Notification Grid -->
    <transition-group name="fade-up" tag="div" class="notif-grid">
      <div v-for="n in notifications" :key="n.id" class="notif-card">
        <div class="notif-header">
          <h5 class="notif-title">{{ n.title }}</h5>
          <div class="notif-date">{{ formatDate(n.created_at) }}</div>
        </div>

        <!-- Image or Random Cute Fallback -->
        <img
          :src="n.image_url || getRandomIcon(n.id)"
          class="notif-image"
          alt="notification image"
        />

        <p class="notif-body">{{ n.body }}</p>

        <!-- ✅ Optional Link Display -->
        <a
          v-if="n.link"
          :href="n.link"
          target="_blank"
          rel="noopener noreferrer"
          class="notif-link"
        >
          🔗 Visit Link
        </a>

        <div class="notif-footer">
          <span
            class="tag"
            :class="isNew(n.created_at) ? 'tag-new' : 'tag-old'"
          >
            {{ isNew(n.created_at) ? '🆕 New' : '📜 Old' }}
          </span>
          <span class="notif-author">{{ n.author || 'Admin' }}</span>
        </div>
      </div>
    </transition-group>

    <div v-if="!loading && notifications.length === 0" class="no-data">
      🌸 No notifications yet — check back later!
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'

const { supabase } = useSupabase()
const notifications = ref([])
const loading = ref(true)
const connectionStatus = ref('checking')
const showToast = ref(false)

/* 💖 Cute fallback image URLs */
const cuteImages = [
  'https://cdn-icons-png.flaticon.com/512/616/616408.png',
  'https://cdn-icons-png.flaticon.com/512/2762/2762699.png',
  'https://cdn-icons-png.flaticon.com/512/616/616490.png',
  'https://cdn-icons-png.flaticon.com/512/3468/3468378.png',
  'https://cdn-icons-png.flaticon.com/512/3468/3468354.png',
  'https://cdn-icons-png.flaticon.com/512/3468/3468368.png',
]

const getRandomIcon = (seed) => {
  const index = Math.abs(hashCode(String(seed))) % cuteImages.length
  return cuteImages[index]
}

const hashCode = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

/* 🔄 Fetch notifications */
const fetchNotifications = async () => {
  loading.value = true
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Fetch error:', error.message)
    loading.value = false
    return
  }
  notifications.value = data || []
  loading.value = false
}

/* ⚡ Realtime updates */
const setupRealtime = () => {
  supabase
    .channel('notifications-updates')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      payload => {
        notifications.value.unshift(payload.new)
        triggerToast()
      }
    )
    .subscribe()
}

/* ✅ Connection check */
const checkConnection = async () => {
  try {
    const { error } = await supabase.from('notifications').select('*').limit(1)
    connectionStatus.value = error ? 'error' : 'connected'
  } catch {
    connectionStatus.value = 'error'
  }
}

/* ✨ Toast for new posts */
const triggerToast = () => {
  showToast.value = true
  setTimeout(() => (showToast.value = false), 3000)
}

/* 🗓 Date formatting */
const formatDate = iso => {
  const date = new Date(iso)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    weekday: 'long',
  })
}

/* 💡 Tag new if within 2 days */
const isNew = iso => {
  const created = new Date(iso)
  const now = new Date()
  const diff = (now - created) / (1000 * 60 * 60 * 24)
  return diff < 2
}

onMounted(async () => {
  await checkConnection()
  await fetchNotifications()
  setupRealtime()
})
</script>

<style scoped lang="scss">
/* 🌈 Background */
.notif-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fdf1ff, #e3f6ff, #fffbe6);
  padding: 2rem 1rem;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ✨ Title */
.page-title {
  font-weight: 700;
  font-size: 1.6rem;
  background: linear-gradient(90deg, #845ef7, #ff6bcb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-align: center;
  margin-bottom: 1rem;
}

/* 🩵 Connection badge */
.connection-status {
  margin-bottom: 1rem;
  .status {
    font-weight: 600;
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
    border-radius: 8px;
    color: #fff;
    &.success { background: linear-gradient(90deg, #22c55e, #16a34a); }
    &.error { background: linear-gradient(90deg, #f43f5e, #e11d48); }
    &.loading { background: linear-gradient(90deg, #60a5fa, #3b82f6); }
  }
}

/* ✨ Toast */
.toast {
  position: fixed;
  top: 20px;
  z-index: 9999;
  background: linear-gradient(90deg, #845ef7, #ff6bcb);
  color: white;
  padding: 0.8rem 1.4rem;
  border-radius: 20px;
  font-weight: 500;
  box-shadow: 0 6px 20px rgba(132, 94, 247, 0.3);
}
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.4s ease;
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* 💫 Responsive Grid */
.notif-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.2rem;
  width: 100%;
  max-width: 1000px;
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 🪩 Card */
.notif-card {
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 1rem 1.2rem;
  box-shadow: 0 6px 25px rgba(132, 94, 247, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.25s ease;
  animation: popIn 0.4s ease;
  display: flex;
  flex-direction: column;
  &:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 10px 30px rgba(132, 94, 247, 0.25);
  }
}

/* 🧃 Header */
.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
  .notif-title {
    font-weight: 600;
    font-size: 1rem;
    color: #333;
    flex: 1;
    line-height: 1.3;
  }
  .notif-date {
    font-size: 0.75rem;
    color: #777;
    white-space: nowrap;
  }
}

/* 💌 Body */
.notif-body {
  color: #555;
  line-height: 1.5;
  font-size: 0.9rem;
  margin-top: 0.4rem;
}

/* 🖼 Image */
.notif-image {
  width: 100%;
  border-radius: 12px;
  margin: 0.4rem 0;
  object-fit: cover;
  height: 160px;
}

/* 🔗 Link Button */
.notif-link {
  margin-top: 0.6rem;
  align-self: flex-start;
  background: linear-gradient(90deg, #a855f7, #ec4899);
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  text-decoration: none;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 3px 10px rgba(236, 72, 153, 0.3);
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 14px rgba(236, 72, 153, 0.4);
  }
}

/* 📎 Footer */
.notif-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  .tag {
    font-weight: 600;
    font-size: 0.75rem;
    padding: 0.3rem 0.7rem;
    border-radius: 10px;
    color: white;
    &.tag-new { background: linear-gradient(90deg, #a855f7, #ec4899); }
    &.tag-old { background: linear-gradient(90deg, #94a3b8, #64748b); }
  }
  .notif-author {
    font-size: 0.8rem;
    color: #666;
  }
}

/* 🌸 Empty / Loading */
.no-data,
.loading-state {
  margin-top: 2rem;
  font-weight: 500;
  color: #777;
  font-size: 1rem;
}

/* ✨ Animations */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(20px);
}
.fade-up-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
@keyframes popIn {
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
