<template>
  <div class="app-container">
    <!-- 🌈 Main Navbar (Desktop Only) -->
    <nav
      class="navbar navbar-expand-lg py-3 px-4 shadow-sm sticky-top d-none d-lg-flex"
      :class="{ scrolled: isScrolled }"
    >
      <router-link to="/" class="navbar-brand d-flex align-items-center">
        <i class="bi bi-lightning-charge-fill me-2 logo-icon"></i>
        <span class="brand-text">GenZ<span class="accent">Shop</span></span>
      </router-link>

      <div class="collapse navbar-collapse justify-content-end">
        <ul class="navbar-nav d-flex align-items-center gap-4 mb-0">
          <li v-for="link in navLinks" :key="link.to" class="nav-item position-relative">
            <router-link :to="link.to" class="nav-link" :class="{ active: currentRoute === link.to }">
              {{ link.title }}
              <span v-if="link.to === '/cart' && cartCount > 0" class="counter-bubble">{{ cartCount }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>

    <!-- 🚀 Always-visible iOS Glass Quickbar (Mobile Only) -->
    <div class="mobile-quickbar d-lg-none">
      <div
        v-for="icon in quickAccess"
        :key="icon.to"
        class="quick-icon position-relative"
        :class="{ active: currentRoute === icon.to }"
        @click="goTo(icon.to)"
      >
        <i :class="icon.icon"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

// 🧭 Router setup
const router = useRouter()
const route = useRoute()

// 🎯 Scroll for navbar color only
const isScrolled = ref(false)
const handleScroll = () => {
  isScrolled.value = window.scrollY > 20
}

onMounted(() => window.addEventListener('scroll', handleScroll))
onBeforeUnmount(() => window.removeEventListener('scroll', handleScroll))

// 📍 Active route detection
const currentRoute = computed(() => route.path)

// 🛒 Dummy cart count (connect with store later)
const cartCount = ref(0)

// 🔗 Links
const navLinks = [
  { to: '/', title: 'Home' },
  { to: '/shop', title: 'Shop' },
  { to: '/cart', title: 'Cart' },
  { to: '/orders', title: 'Orders' },
  { to: '/profile', title: 'Profile' }
]

const quickAccess = [
  { to: '/', icon: 'bi bi-house-door-fill' },
  { to: '/shop', icon: 'bi bi-grid-1x2-fill' },
  { to: '/cart', icon: 'bi bi-cart-fill' },
  { to: '/orders', icon: 'bi bi-bag-check-fill' },
  { to: '/profile', icon: 'bi bi-person-fill' }
]

// 🚀 Navigation handler
const goTo = (path) => router.push(path)
</script>

<style scoped lang="scss">
/* ===== Counter Bubble ===== */
.counter-bubble {
  position: absolute;
  top: -5px;
  right: -10px;
  background: #ff6f91;
  color: white;
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 50%;
  animation: popIn 0.3s ease;
}

/* ===== Navbar (Desktop Only) ===== */
.navbar {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(25px);
  border-bottom: 2px solid rgba(255, 182, 193, 0.2);
  transition: all 0.4s ease;
  z-index: 1000;

  &.scrolled {
    background: linear-gradient(90deg, #ff9a9e, #fad0c4);
    box-shadow: 0 2px 25px rgba(255, 111, 181, 0.25);
  }

  .navbar-brand {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    font-size: 1.6rem;
    background: linear-gradient(90deg, #ff9a9e, #fad0c4, #a1c4fd);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;

    .logo-icon {
      font-size: 1.8rem;
      background: linear-gradient(90deg, #ff6f91, #ff9671);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: pulseGlow 2s infinite ease-in-out;
    }
  }

  .nav-link {
    font-size: 1.1rem;
    color: #333;
    font-weight: 500;
    transition: all 0.3s ease;

    &:hover {
      color: #ff6f91;
      transform: translateY(-2px);
    }

    &.active {
      color: #ff6f91;
      text-shadow: 0 0 6px rgba(255, 111, 181, 0.6);
    }
  }
}

/* ===== iOS Glass Quickbar (Mobile Only) ===== */
.mobile-quickbar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 12px 0;
  z-index: 1500;

  /* 🌈 iOS Glassmorphism + Gradient Glow */
  background: linear-gradient(120deg, rgba(255, 182, 193, 0.35), rgba(255, 255, 255, 0.3));
  backdrop-filter: blur(25px);
  border-top: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 -2px 25px rgba(255, 111, 181, 0.25);
  border-radius: 22px 22px 0 0;

  .quick-icon {
    color: #555;
    font-size: 1.6rem;
    transition: all 0.25s ease;
    position: relative;

    &:hover {
      transform: scale(1.15);
      color: #ff6f91;
    }

    &.active {
      color: #ff6f91;
      text-shadow: 0 0 10px rgba(255, 111, 181, 0.9);
      transform: scale(1.2);
    }

    &::after {
      content: "";
      position: absolute;
      bottom: -5px;
      left: 50%;
      transform: translateX(-50%);
      width: 6px;
      height: 6px;
      background: #ff6f91;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &.active::after {
      opacity: 1;
    }
  }
}

/* ===== Glow Animations ===== */
@keyframes pulseGlow {
  0%, 100% { filter: drop-shadow(0 0 5px rgba(255, 111, 181, 0.6)); }
  50% { filter: drop-shadow(0 0 12px rgba(255, 111, 181, 0.9)); }
}

@keyframes popIn {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* 🩵 Optional: Add slight padding to body to avoid overlap with fixed bar */
@media (max-width: 992px) {
  body {
    padding-bottom: 70px;
  }
}
</style>
