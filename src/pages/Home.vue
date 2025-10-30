<template>
  <div>
    <!-- 🌈 Hero Section -->
    <section class="hero-flat d-flex flex-wrap justify-content-between align-items-center py-5 px-5 mb-5">
      <div class="hero-text col-lg-6 col-md-12 mb-4 mb-lg-0">
        <h1 class="display-4 fw-bold">
          <span class="gradient-text">ScrollPaglu Spot✨</span><br />
          <span class="sub-title">Where Style Meets Vibe 😉</span>
        </h1>
        <p class="lead">
          Your one-stop space for aesthetic finds, cool gadgets, and statement pieces — all made for the bold GenZ spirit ⚡
        </p>
        <router-link to="/shop" class="btn btn-primary btn-lg mt-4 flat-btn">Start Exploring →</router-link>
      </div>

      <div class="hero-image col-lg-6 col-md-12 text-center">
        <img
          src="https://tse3.mm.bing.net/th/id/OIP.nMpXMDUZNys8gutdu7ZsgQHaHa?pid=ImgDet&w=191&h=191&c=7&o=7&rm=3"
          alt="Human Cartoon Illustration"
          class="hero-illu"
        />
      </div>
    </section>

    <!-- 💖 GenZ Vibe Picks -->
    <section class="recommended mb-5 px-3 py-4">
      <div class="section-header d-flex align-items-center justify-content-center mb-4">
        <i class="bi bi-stars sparkle-icon me-2"></i>
        <h3 class="section-title text-gradient mb-0">GenZ Vibe Picks 💅</h3>
        <i class="bi bi-stars sparkle-icon ms-2"></i>
      </div>

      <p class="text-center section-subtitle mb-4">
        Just dropped — trending vibes, aesthetic energy, and must-haves for your feed ⚡
      </p>

      <!-- 🌀 Carousel Section -->
      <div class="recommended-carousel d-flex overflow-x-auto pb-3 position-relative">
        <div
          class="flex-shrink-0 me-3 card-wrapper"
          v-for="(item, index) in vibeProducts"
          :key="item.id"
          :style="{ transform: `translateY(${getRandomOffset(index)}px)` }"
        >
          <div class="vibe-card text-center p-3">
            <div class="image-container">
              <img
                :src="item.image_url || 'https://cdn.dribbble.com/users/722835/screenshots/15366298/media/67361a39e4dff553a34c0b54f613b22b.gif'"
                alt="Vibe Product"
                class="vibe-img mb-3"
              />
              <div class="border-anim"></div>
            </div>

            <h5 class="fw-semibold mb-2 vibe-name">{{ item.name }}</h5>
            <p class="vibe-price mb-2">₹{{ item.price.toFixed(2) }}</p>
            <p class="vibe-desc mb-3">{{ item.description }}</p>

            <button class="like-btn" @click="likeProduct(item, $event)">
              <i class="bi bi-heart-fill me-2 sparkle-heart"></i> {{ item.likes }}
            </button>
          </div>
        </div>

        <div class="scroll-hint">⇠ Scroll to vibe more ⇢</div>
      </div>
    </section>

    <!-- 🌸 Footer -->
    <!-- 🌸 Floating MoodBar (Footer Replacement) -->
<div class="floating-moodbar" :class="{ visible: isVisible }">
  <div class="mood-content d-flex align-items-center justify-content-between px-3">
    <div class="emoji-eyes">
      <span class="eye left-eye"></span>
      <span class="eye right-eye"></span>
    </div>

    <div class="mood-text text-center flex-grow-1">
      <p class="mb-0 fw-semibold">{{ moodMessage }}</p>
    </div>

    <button class="scroll-top-btn" @click="scrollToTop">
      <i class="bi bi-arrow-up-circle-fill"></i>
    </button>
  </div>
</div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../composables/useSupabase'

const vibeProducts = ref([])
const offsets = ref([])

const fetchVibeProducts = async () => {
  try {
    const { data, error } = await supabase.from('recommended_products').select('*')
    if (error) throw error
    vibeProducts.value = data || []
  } catch (err) {
    console.error('Error fetching vibe products:', err.message)
  }
}

const likeProduct = async (item, event) => {
  const heart = event.currentTarget.querySelector('.sparkle-heart')
  heart.classList.add('burst')
  setTimeout(() => heart.classList.remove('burst'), 500)

  item.likes += 1
  const { error } = await supabase
    .from('recommended_products')
    .update({ likes: item.likes })
    .eq('id', item.id)
  if (error) console.error('Error updating likes:', error.message)
}

const getRandomOffset = (index) => {
  if (offsets.value[index] === undefined) {
    offsets.value[index] = Math.floor(Math.random() * 31) - 15
  }
  return offsets.value[index]
}

onMounted(fetchVibeProducts)


const isVisible = ref(false)
const moodMessage = ref('✨ Loading your vibe...')

const getMoodMessage = () => {
  const hour = new Date().getHours()
  if (hour < 12) return '🌞 Good morning, Trendsetter!'
  if (hour < 18) return '☀️ Slaying the day, huh?'
  if (hour < 22) return '🌇 Evening glow-up time ✨'
  return '🌙 Late-night scroll, you aesthetic owl 🦉'
}

const handleScroll = () => {
  const scrollY = window.scrollY
  isVisible.value = scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  moodMessage.value = getMoodMessage()
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Playfair+Display:wght@600;700&family=Dancing+Script:wght@600&display=swap');

/* 🌈 Hero Section */
.hero-flat {
  background: linear-gradient(135deg, #fdfbff, #f7e9ff);
  width: 100%;
  overflow: hidden;

  .hero-text {
    h1 {
      font-family: 'Playfair Display', serif;
      font-weight: 700;
      font-size: 3.3rem;
      color: #3a0ca3;
      .gradient-text {
        background: linear-gradient(90deg, #845ef7, #ff6bcb, #ffc2e2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        font-size: 3.5rem;
        font-family: 'Dancing Script', cursive;
      }
      .sub-title {
        display: block;
        font-size: 1.4rem;
        color: #5a189a;
        font-family: 'Poppins', sans-serif;
      }
    }
    p {
      font-family: 'Poppins', sans-serif;
      color: #555;
      font-size: 1.15rem;
      margin-top: 15px;
    }
    .flat-btn {
      background: linear-gradient(45deg, #845ef7, #ff6bcb);
      border: none;
      color: white;
      padding: 0.8rem 2rem;
      border-radius: 50px;
      font-weight: 600;
      transition: 0.3s;
      &:hover {
        background: linear-gradient(45deg, #6c63ff, #ff47a3);
        transform: scale(1.07);
      }
    }
  }

  .hero-image .hero-illu {
    max-width: 80%;
    animation: float 3s ease-in-out infinite;
    border-radius: 6%;
  }

  @keyframes float {
    0% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
    100% { transform: translateY(0px); }
  }
}

/* 💅 Recommended Section */
.recommended {
  background: linear-gradient(180deg, #fff8fb, #f7e9ff);
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(255, 107, 203, 0.15);
  padding-bottom: 3rem;

  .section-header {
    .section-title {
      font-family: 'Poppins', sans-serif;
      font-weight: 700;
      background: linear-gradient(90deg, #ff9a9e, #fad0c4, #fbc2eb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      font-size: 1.9rem;
    }
  }

  .section-subtitle {
    font-family: 'Poppins', sans-serif;
    color: #6a4c93;
  }

  .recommended-carousel {
    display: flex;
    gap: 20px;
    overflow-x: auto;
    scroll-behavior: smooth;
    scrollbar-width: none;
    padding: 10px 15px;
    &::-webkit-scrollbar {
      display: none;
    }

    .scroll-hint {
      position: absolute;
      bottom: 0;
      width: 100%;
      text-align: center;
      font-size: 0.9rem;
      color: #b36bff;
      opacity: 0.7;
      animation: fadeHint 2s infinite ease-in-out;
    }
  }
}

/* ✨ Product Card with gradient border & animations */
.vibe-card {
  position: relative;
  background: #fff;
  border-radius: 22px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(255, 107, 203, 0.15);
  transition: all 0.4s ease;
  width: 310px;
  min-height: 390px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;

  &:hover {
    transform: translateY(-8px) scale(1.05);
    box-shadow: 0 12px 30px rgba(255, 107, 203, 0.3);
  }

  .vibe-price {
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  color: #61ff73;
  font-size: 1rem;
}

  .image-container {
    position: relative;
    border-radius: 20px;
    overflow: hidden;
    width: 180px;
    height: 180px;
    margin-bottom: 1rem;

    .vibe-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 20px;
    }

    .border-anim {
      position: absolute;
      inset: 0;
      border-radius: 20px;
      border: 3px solid transparent;
      background: linear-gradient(60deg, #ff6bcb, #845ef7, #ffc2e2, #ff6bcb);
      background-size: 300% 300%;
      -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      animation: borderFlow 4s linear infinite;
    }
  }

  .vibe-name {
    font-family: 'Poppins', sans-serif;
    font-weight: 700;
    color: #3a0ca3;
    font-size: 1.1rem;
  }

  .vibe-desc {
    font-family: 'Poppins', sans-serif;
    font-size: 0.9rem;
    color: #6a4c93;
    padding: 0 10px;
  }

  .like-btn {
    background: linear-gradient(90deg, #ff61d2, #fe9090);
    border: none;
    color: white;
    border-radius: 50px;
    padding: 0.6rem 1.2rem;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.25s ease;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 0 15px rgba(255, 107, 203, 0.3);
    }

    .sparkle-heart {
      animation: sparkle 1.5s ease infinite alternate;
    }
  }
}

/* 🌈 Animations */
@keyframes borderFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes sparkle {
  0%, 100% { transform: scale(1); color: #fff; text-shadow: 0 0 5px #ff61d2; }
  50% { transform: scale(1.3); color: #ffd6f6; text-shadow: 0 0 12px #ff9ae2; }
}

@keyframes burst {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.8); opacity: 0.6; }
  100% { transform: scale(1); opacity: 1; }
}
.burst {
  animation: burst 0.5s ease;
}

@keyframes fadeHint {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 0.3; }
}

/* 📱 Responsiveness */
@media (max-width: 768px) {
  .vibe-card {
    width: 260px;
    min-height: 350px;
  }
  .image-container {
    width: 150px;
    height: 150px;
  }
}

@media (max-width: 576px) {
  .hero-text h1 {
    font-size: 2.2rem;
  }
  .hero-image img {
    max-width: 100%;
  }
  .vibe-card {
    width: 220px;
    min-height: 320px;
  }
  .image-container {
    width: 130px;
    height: 130px;
  }
}

/* 💜 Footer */
.footer-flat {
  background: linear-gradient(90deg, #845ef7, #ff6bcb);
  color: #fff;
  width: 100%;
  .social-icons {
    margin: 8px 0;
    .social-link {
      color: #fff;
      margin: 0 8px;
      font-size: 1.4rem;
      transition: 0.3s;
      &:hover {
        transform: scale(1.2);
        color: #ffd6f6;
      }
    }
  }
}


.floating-moodbar {
  position: fixed;
  bottom: -80px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #ffb6c1, #ffc2e2, #ff9ae2);
  color: #3a0ca3;
  border-radius: 50px;
  box-shadow: 0 6px 18px rgba(255, 107, 203, 0.3);
  width: 90%;
  max-width: 500px;
  height: 60px;
  z-index: 9999;
  transition: all 0.5s ease;
  opacity: 0;
  backdrop-filter: blur(10px);

  &.visible {
    bottom: 20px;
    opacity: 1;
  }

  .mood-content {
    height: 100%;
  }

  .emoji-eyes {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-right: 10px;
    position: relative;
  }

  .eye {
    width: 16px;
    height: 16px;
    background: #fff;
    border-radius: 50%;
    position: relative;
    overflow: hidden;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);
    animation: blink 4s infinite;
  }

  .eye::before {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    background: #3a0ca3;
    border-radius: 50%;
    top: 4px;
    left: 4px;
    transition: 0.2s ease;
    animation: eyeMove 3s infinite;
  }

  .scroll-top-btn {
    background: none;
    border: none;
    color: #3a0ca3;
    font-size: 1.6rem;
    transition: 0.3s ease;
    &:hover {
      color: #ff61d2;
      transform: scale(1.2);
    }
  }
}

/* 🫧 Eye Animations */
@keyframes blink {
  0%, 95%, 100% { transform: scaleY(1); }
  97% { transform: scaleY(0.1); }
}

@keyframes eyeMove {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(2px, 1px); }
  50% { transform: translate(-2px, 1px); }
  75% { transform: translate(1px, -2px); }
}

/* 📱 Responsiveness */
@media (max-width: 576px) {
  .floating-moodbar {
    height: 55px;
    font-size: 0.85rem;
    width: 95%;
    .scroll-top-btn {
      font-size: 1.3rem;
    }
  }
}

</style>
