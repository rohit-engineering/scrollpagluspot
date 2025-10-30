<template>
  <div class="profile-page">
    <div class="profile-card text-center">
      <h3 class="profile-title">Your Profile ✨</h3>

      <!-- Not logged in -->
      <div v-if="!user" class="not-logged">
        <p>Please login or signup to access your profile</p>
        <router-link to="/login" class="btn btn-primary me-2">Login</router-link>
        <router-link to="/signup" class="btn btn-success">Sign Up</router-link>
      </div>

      <!-- Logged in -->
      <div v-else class="profile-info">
        <!-- Pokémon Avatar -->
        <div class="avatar-container">
          <img :src="pokemonAvatar" alt="Pokemon Avatar" class="avatar" />
          <span class="badge">{{ badge }}</span>
        </div>

        <!-- Profile Details -->
        <h4 class="user-name">{{ profileData.full_name || 'Unnamed Hero' }}</h4>
        <p class="user-username">{{ genZUsername }}</p>
        <p class="user-email">{{ profileData.email }}</p>

        <!-- Motivational Quote -->
        <p class="user-quote">
          “{{ randomQuote }}”
        </p>

        <button class="btn btn-outline-danger mt-3 w-100" @click="handleLogout">
          Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, watch, computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useSupabase'
import { useToast } from 'vue-toastification'

const trendyWords = [
  'vibe', 'cosmic', 'glitchy', 'dreamy', 'neon', 'xoxo', 'lit', 'chill',
  'frosty', 'fuzzy', 'sunny', 'stormy', 'electric', 'galaxy', 'zen', 'hype',
  'bubble', 'pixel', 'flux', 'nova'
]
const emojis = ['✨','💜','💫','🌸','🔥','🌈','⚡','💎','🌙','☁️']
const badges = ['💎 Trendsetter', '🔥 Style Icon', '🌸 Cool Soul', '⚡ Trendy GenZ', '🌈 OG Shopper']
const quotes = [
  "Shop like nobody’s watching, style like everyone is!",
  "You don’t need an occasion to look iconic 💅",
  "Shopping is cheaper than therapy, and twice as fun 💜",
  "Stay extra, because basic is boring ✨",
  "Buy it. Your future self will thank you 💫"
]

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

export default {
  setup() {
    const { user, profile, logout } = useAuth()
    const router = useRouter()
    const toast = useToast()

    const profileData = reactive({
      full_name: profile.value?.full_name || '',
      email: user.value?.email || ''
    })

    watch(profile, (newProfile) => {
      if (newProfile) profileData.full_name = newProfile.full_name
    })
    watch(user, (newUser) => {
      if (newUser) profileData.email = newUser.email
    })

    // ✨ Gen Z Username
    const genZUsername = computed(() => {
      const namePart = profileData.full_name
        ? profileData.full_name.split(' ')[0].toLowerCase()
        : randomElement(trendyWords)
      const word = randomElement(trendyWords)
      const emoji = randomElement(emojis)
      const number = Math.floor(Math.random() * 900 + 100)
      return `@${namePart}_${word}${number}${emoji}`
    })

    // 🩵 Pokémon Avatar
    const pokemonAvatar = ref('')
    const fetchPokemon = async () => {
      try {
        const randomId = Math.floor(Math.random() * 151) + 1 // Gen 1 Pokémon
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`)
        const data = await res.json()
        pokemonAvatar.value = data.sprites.other['official-artwork'].front_default
      } catch (e) {
        pokemonAvatar.value =
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png' // fallback Pikachu
      }
    }

    onMounted(fetchPokemon)

    const badge = randomElement(badges)
    const randomQuote = randomElement(quotes)

    const handleLogout = async () => {
      await logout()
      toast.info('Logged out!')
      router.push('/login')
    }

    return {
      user,
      profileData,
      genZUsername,
      pokemonAvatar,
      badge,
      randomQuote,
      handleLogout
    }
  }
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

.profile-page {
  min-height: calc(100vh - 70px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #fdfbff, #f7e9ff);
}

.profile-card {
  background: white;
  border-radius: 25px;
  box-shadow: 0 10px 30px rgba(255, 107, 203, 0.15);
  padding: 2.5rem;
  width: 100%;
  max-width: 420px;
  text-align: center;
  transition: all 0.3s ease;
  animation: floatCard 3s ease-in-out infinite;
}

.avatar-container {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.avatar {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 4px solid transparent;
  background-image: linear-gradient(white, white),
    linear-gradient(45deg, #ff6bcb, #845ef7);
  background-origin: border-box;
  background-clip: content-box, border-box;
  box-shadow: 0 0 15px rgba(132, 94, 247, 0.3);
  object-fit: contain;
  transition: transform 0.3s ease;
}
.avatar:hover {
  transform: scale(1.08) rotate(3deg);
}

.badge {
  position: absolute;
  bottom: -10px;
  right: -8px;
  background: linear-gradient(90deg, #ff6bcb, #845ef7);
  color: white;
  padding: 0.3rem 0.7rem;
  border-radius: 30px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 3px 10px rgba(255, 107, 203, 0.3);
}

.profile-title {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 2rem;
  background: linear-gradient(90deg, #ff6bcb, #845ef7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1.5rem;
}

.user-name {
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
}

.user-username {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  color: #845ef7;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.user-email {
  font-family: 'Poppins', sans-serif;
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 0.8rem;
}

.user-quote {
  font-family: 'Poppins', sans-serif;
  font-style: italic;
  color: #ff6bcb;
  margin-bottom: 1.5rem;
}

.btn {
  border-radius: 50px;
  padding: 0.6rem 1.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-outline-danger {
  border-color: #ff6bcb;
  color: #ff6bcb;
  &:hover {
    background: #ff6bcb;
    color: white;
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 107, 203, 0.4);
  }
}

/* 🌸 Mobile Responsiveness */
@media (max-width: 576px) {
  .profile-card {
    padding: 1.5rem;
    border-radius: 18px;
    box-shadow: 0 6px 18px rgba(255, 107, 203, 0.15);
  }

  .profile-title {
    font-size: 1.6rem;
  }

  .avatar {
    width: 90px;
    height: 90px;
  }

  .user-name {
    font-size: 1.3rem;
  }

  .user-username {
    font-size: 1rem;
  }

  .user-email {
    font-size: 0.95rem;
  }

  .user-quote {
    font-size: 0.9rem;
  }

  .btn {
    padding: 0.6rem;
    font-size: 0.95rem;
  }
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}
</style>
