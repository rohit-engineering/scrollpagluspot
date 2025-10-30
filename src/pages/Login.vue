<template>
  <div class="auth-page d-flex justify-content-center align-items-center">
    <div class="auth-card p-4">
      <h3 class="auth-title">Welcome Back ✨</h3>
      <p class="auth-subtitle">Login to continue exploring the coolest finds!</p>
      <form @submit.prevent="onLogin">
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" class="form-control" placeholder="your@email.com" required />
        </div>
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" class="form-control" placeholder="••••••••" required />
        </div>
        <button :disabled="loading" class="btn btn-primary w-100">
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>
      <p class="mt-3 text-center">
        Don't have an account? <router-link to="/signup" class="link-gradient">Sign up</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useSupabase'
import { useToast } from 'vue-toastification'

export default {
  setup() {
    const email = ref('')
    const password = ref('')
    const loading = ref(false)
    const router = useRouter()
    const toast = useToast()
    const { user, login } = useAuth()

    onMounted(() => {
      if (user.value) router.push('/profile')
    })

    const onLogin = async () => {
      loading.value = true
      try {
        await login(email.value, password.value)
        toast.success('Logged in successfully!')
        router.push('/profile')
      } catch (err) {
        toast.error(err.message || JSON.stringify(err))
      } finally {
        loading.value = false
      }
    }

    return { email, password, loading, onLogin }
  }
}
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Dancing+Script:wght@600&display=swap');

.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fceaff, #d0f0fd);
  display: flex;
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(255, 111, 203, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
  animation: floatCard 3s ease-in-out infinite;
}

.auth-title {
  font-family: 'Dancing Script', cursive;
  font-size: 2.2rem;
  background: linear-gradient(90deg, #ff6bcb, #845ef7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.3rem;
}

.auth-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  color: #555;
  margin-bottom: 1.5rem;
}

.form-control {
  border-radius: 50px;
  padding: 0.75rem 1rem;
  border: 1px solid #ddd;
  transition: all 0.3s ease;
  &:focus {
    border-color: #ff6bcb;
    box-shadow: 0 0 8px rgba(255, 107, 203, 0.3);
  }
}

.btn-primary {
  background: linear-gradient(45deg, #845ef7, #ff6bcb);
  border: none;
  border-radius: 50px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 107, 203, 0.4);
  }
}

.link-gradient {
  background: linear-gradient(90deg, #ff6bcb, #845ef7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

@media (max-width: 576px) {
  .auth-card {
    padding: 1.5rem;
  }
}
</style>
