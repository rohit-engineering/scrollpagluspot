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

    <!-- 💫 Why ScrollPaglu Section -->
    <section
  class="why-scrollpaglu py-5 px-4"
  :class="{ visible: isWhyVisible }"
  @touchstart="touchStart"
  @touchmove="touchMove"
  @touchend="touchEnd"
>

      <div class="section-header text-center mb-5">
        <h2 class="fw-bold gradient-text">Why ScrollPaglu? 😎</h2>
        <p class="text-muted">Because vibes, quality, and GenZ energy are non-negotiable 💜</p>
      </div>

      <div class="slides-container d-flex align-items-center justify-content-center">
        <div
          class="slide-card text-center"
          v-for="(slide, index) in slides"
          :key="index"
          :class="{ active: index === currentSlide }"
        >
          <img :src="slide.image" alt="Slide Image" class="slide-img mb-3" />
          <h4 class="fw-semibold mb-2">{{ slide.title }}</h4>
          <p class="text-muted">{{ slide.text }}</p>
        </div>
      </div>

      <div class="dots text-center mt-4">
        <span
          v-for="(s, i) in slides"
          :key="i"
          class="dot"
          :class="{ active: i === currentSlide }"
          @click="currentSlide = i"
        ></span>
      </div>
    </section>
    
<!-- 💬 People Love ScrollPaglu Spot Section -->
<section class="testimonials py-5 px-4" :class="{ visible: isTestimonialsVisible }">
  <div class="section-header text-center mb-5">
    <h2 class="fw-bold gradient-text">People Love ScrollPaglu Spot 💬</h2>
    <p class="text-muted">
      Real vibes from our amazing community — 100% authentic energy ✨
    </p>
  </div>

  <!-- 🌈 Carousel Wrapper -->
  <div class="testimonial-carousel" ref="carousel">
    <div
      class="testimonial-card"
      v-for="(review, index) in testimonials"
      :key="index"
    >
      <div class="reviewer-img">
        <img :src="review.avatar" :alt="review.name" />
      </div>
      <p class="review-text">“{{ review.text }}”</p>
      <div class="reviewer-info">
        <h5>{{ review.name }}</h5>
        <span>{{ review.city }}·{{ review.tag }}</span>
        <div class="stars">
          <i class="bi bi-star-fill" v-for="n in 5" :key="n"></i>
        </div>
      </div>
    </div>
  </div>

  <!-- Dots (optional for slide indicators) -->
  <div class="carousel-dots text-center mt-4">
    <span
      v-for="(review, i) in testimonials"
      :key="i"
      class="dot"
      :class="{ active: i === currentReview }"
      @click="setReview(i)"
    ></span>
  </div>
</section>

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

// 🌟 Why ScrollPaglu Slides
const slides = ref([
  {
    image: "https://cdn-icons-png.flaticon.com/512/2917/2917999.png",
    title: "Curated for GenZ 💅",
    text: "Handpicked collections that match your aesthetic, meme culture, and bold personality.",
  },
  {
    image: "https://cdn-icons-png.flaticon.com/512/3208/3208679.png",
    title: "Trendy + Affordable 💸",
    text: "Stay on top of trends without breaking the bank — because being stylish shouldn’t cost a fortune.",
  },
  {
    image: "https://cdn-icons-png.flaticon.com/512/3314/3314395.png",
    title: "Community Driven 💬",
    text: "We vibe check every drop with our community before it hits the site — only 🔥 makes it through.",
  },
])

const currentSlide = ref(0)
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}
onMounted(() => {
  setInterval(nextSlide, 4000)
})

// 👉 Swipe gestures for slides
let startX = 0
const touchStart = (e) => {
  startX = e.touches[0].clientX
}
const touchMove = (e) => {
  const diff = e.touches[0].clientX - startX
  if (Math.abs(diff) > 70) {
    if (diff > 0) {
      // Swipe right
      currentSlide.value =
        (currentSlide.value - 1 + slides.value.length) % slides.value.length
    } else {
      // Swipe left
      currentSlide.value = (currentSlide.value + 1) % slides.value.length
    }
    startX = e.touches[0].clientX // reset
  }
}
const touchEnd = () => {
  startX = 0
}

// 👇 Scroll-trigger animation setup
const isWhyVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isWhyVisible.value = true
      }
    },
    { threshold: 0.3 }
  )

  const target = document.querySelector('.why-scrollpaglu')
  if (target) observer.observe(target)
})

// 💬 Testimonials Data (Realistic Indian Users)
const testimonials = ref([
  {
    name: 'Sienna Mehta',
    city: 'Mumbai',
    tag: '@Siennaxvibes',
    text: 'ScrollPaglu Spot totally gets my vibe — the posters and neon lights gave my room a whole new look 🔥',
    avatar: 'https://mockmind-api.uifaces.co/content/cartoon/14.jpg'
  },
  {
    name: 'Ananya Sharma',
    city: 'Delhi',
    tag: '@ananyastyles',
    text: 'I love how aesthetic everything is here! Got so many compliments for my phone case 💅',
    avatar: 'https://mockmind-api.uifaces.co/content/cartoon/4.jpg'
  },
  {
    name: 'Riya Patel',
    city: 'Bangalore',
    tag: '@riya.vibes',
    text: 'Fast delivery, super cute packaging, and amazing quality — ScrollPaglu never misses 💖',
    avatar: 'https://mockmind-api.uifaces.co/content/cartoon/20.jpg'
  },
  {
    name: 'Rhea Singh',
    city: 'Hyderabad',
    tag: '@sunkissedluna',
    text: 'Bro this site is elite — got my LED wall lights and they’re pure aesthetic goals ✨',
    avatar: 'https://mockmind-api.uifaces.co/content/cartoon/19.jpg'
  },
  {
    name: 'Diya Verma',
    city: 'Pune',
    tag: '@diyadreams',
    text: 'Such a happy place to shop from — cute stuff, chill prices, and totally GenZ vibes 💜',
    avatar: 'https://mockmind-api.uifaces.co/content/cartoon/18.jpg'
  }
])


import { onBeforeUnmount } from 'vue'

// 🌈 Carousel Logic
const currentReview = ref(0)
const carousel = ref(null)
let carouselInterval = null

const scrollToReview = (index) => {
  if (!carousel.value) return
  const cardWidth = carousel.value.firstElementChild?.offsetWidth || 0
  const gap = 16 // same as CSS gap: 1rem (approx)
  const scrollAmount = index * (cardWidth + gap)
  carousel.value.scrollTo({
    left: scrollAmount,
    behavior: 'smooth'
  })
}

const startAutoSlide = () => {
  // Clear if already running
  if (carouselInterval) clearInterval(carouselInterval)

  // smoother timing for small screens
  const duration = window.innerWidth < 768 ? 5000 : 4000

  carouselInterval = setInterval(() => {
    currentReview.value = (currentReview.value + 1) % testimonials.value.length
    scrollToReview(currentReview.value)
  }, duration)
}

const setReview = (index) => {
  currentReview.value = index
  scrollToReview(index)
  startAutoSlide() // reset timer after manual click
}
const isTestimonialsVisible = ref(false)

onMounted(() => {
  if (carousel.value) startAutoSlide()

  const observer2 = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        isTestimonialsVisible.value = true
      }
    },
    { threshold: 0.3 }
  )

  const target2 = document.querySelector('.testimonials')
  if (target2) observer2.observe(target2)
})

onBeforeUnmount(() => {
  if (carouselInterval) clearInterval(carouselInterval)
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

/*floating moodbar*/

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

/* 🌟 Why ScrollPaglu Section */
.why-scrollpaglu {
  background: linear-gradient(180deg, #fff7ff 0%, #f7e9ff 100%);
  border-radius: 28px;
  box-shadow: 0 10px 35px rgba(132, 94, 247, 0.15);
  position: relative;
  padding-bottom: 4rem;
  overflow: hidden;

  .section-header {
    h2 {
      font-family: 'Playfair Display', serif;
      font-size: 2.6rem;
      font-weight: 800;
      background: linear-gradient(90deg, #a36bff, #ff6bcb, #ffc2e2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: 1px;
    }

    p {
      color: #7b6da3;
      font-family: 'Poppins', sans-serif;
      font-size: 1rem;
      margin-top: 8px;
    }
  }

  .slides-container {
    position: relative;
    max-width: 880px;
    margin: 0 auto;
    height: 300px;
    perspective: 1200px; // For subtle 3D effect
  }

  .slide-card {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%) scale(0.85) rotateY(25deg);
    opacity: 0;
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(132, 94, 247, 0.1);
    border-radius: 22px;
    padding: 2rem 2.2rem;
    width: 80%;
    text-align: center;
    box-shadow: 0 10px 30px rgba(132, 94, 247, 0.12);
    backdrop-filter: blur(10px);
    transition: all 0.9s cubic-bezier(0.22, 1, 0.36, 1);

    &.active {
      opacity: 1;
      transform: translateX(-50%) scale(1) rotateY(0);
      z-index: 3;
      background: linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(250, 230, 255, 0.9));
      box-shadow: 0 12px 35px rgba(255, 107, 203, 0.25);
      animation: pulseGlow 4s ease-in-out infinite;
    }

    .slide-img {
      width: 80px;
      height: 80px;
      object-fit: contain;
      margin-bottom: 1.2rem;
      animation: floatIcon 3.5s ease-in-out infinite;
    }

    h4 {
      font-family: 'Poppins', sans-serif;
      color: #3a0ca3;
      font-size: 1.25rem;
      margin-bottom: 0.6rem;
    }

    p {
      font-family: 'Poppins', sans-serif;
      color: #6a4c93;
      font-size: 0.95rem;
    }
  }

  .dots {
    text-align: center;
    margin-top: 2rem;

    .dot {
      display: inline-block;
      width: 12px;
      height: 12px;
      margin: 0 6px;
      border-radius: 50%;
      background: radial-gradient(circle, #d1b3ff 0%, #845ef7 100%);
      box-shadow: 0 0 8px rgba(132, 94, 247, 0.3);
      transition: all 0.3s ease;
      cursor: pointer;

      &.active {
        background: radial-gradient(circle, #ff6bcb, #845ef7);
        transform: scale(1.3);
        box-shadow: 0 0 15px rgba(255, 107, 203, 0.6);
      }

      &:hover {
        transform: scale(1.2);
      }
    }
  }
}

/* 🌈 Animations */
@keyframes floatIcon {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 12px 35px rgba(255, 107, 203, 0.25); }
  50% { box-shadow: 0 14px 40px rgba(255, 107, 203, 0.45); }
}

/* 📱 Responsive Tweaks */
@media (max-width: 768px) {
  .why-scrollpaglu {
    .slide-card {
      width: 90%;
      padding: 1.8rem;
      .slide-img {
        width: 65px;
        height: 65px;
      }
      h4 { font-size: 1.1rem; }
      p { font-size: 0.9rem; }
    }
  }
}

/* 🌈 Scroll-trigger Entrance Animations */
.why-scrollpaglu {
  opacity: 0;
  transform: translateY(60px);
  transition: all 0.9s ease-out;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .section-header {
    opacity: 0;
    transform: translateY(20px);
    transition: all 1s ease 0.2s;
  }

  &.visible .section-header {
    opacity: 1;
    transform: translateY(0);
  }

  .slides-container {
    opacity: 0;
    transform: scale(0.96);
    transition: all 1.1s ease 0.4s;
  }

  &.visible .slides-container {
    opacity: 1;
    transform: scale(1);
  }

  .dots {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.9s ease 0.7s;
  }

  &.visible .dots {
    opacity: 1;
    transform: translateY(0);
  }
}


/* 💬 Testimonials Carousel Section */
.testimonials {
  background: linear-gradient(180deg, #fdfbff, #fff0fb);
  border-radius: 24px;
  box-shadow: 0 8px 25px rgba(255, 107, 203, 0.1);
  overflow: hidden;
  text-align: center;
  position: relative;
  padding: 3rem 1.2rem;

  .section-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2.2rem;
    background: linear-gradient(90deg, #845ef7, #ff6bcb, #ffc2e2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  /* 🌈 Carousel Container */
  .testimonial-carousel {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 1rem;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  -ms-overflow-style: none;
  scrollbar-width: none;
  padding: 0 10px;
  justify-content: flex-start;
}

.testimonial-carousel::-webkit-scrollbar {
  display: none;
}

  /* 🌸 Testimonial Card */
  .testimonial-card {
    flex: 0 0 calc(100% - 40px);
  max-width: 340px;
  scroll-snap-align: center;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 18px;
  padding: 1.5rem 1.2rem;
  box-shadow: 0 8px 25px rgba(132, 94, 247, 0.12);
  transition: all 0.4s ease;
  margin: 0 auto;

    &:hover {
      transform: translateY(-6px) scale(1.02);
      box-shadow: 0 10px 30px rgba(255, 107, 203, 0.25);
    }

    .reviewer-img {
      width: 70px;
      height: 70px;
      margin: 0 auto 0.8rem;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid transparent;
      background: linear-gradient(120deg, #845ef7, #ff6bcb, #ffc2e2);
      background-clip: padding-box;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
      }
    }

    .review-text {
      font-family: 'Poppins', sans-serif;
      font-size: 0.95rem;
      color: #5a189a;
      font-style: italic;
      line-height: 1.5;
      margin-bottom: 0.9rem;
    }

    .reviewer-info {
      h5 {
        font-weight: 700;
        color: #3a0ca3;
        margin-bottom: 0.2rem;
        font-size: 1rem;
      }
      span {
        font-size: 0.85rem;
        color: #6a4c93;
      }
      .stars {
        margin-top: 0.4rem;
        color: #ff61d2;
        font-size: 1rem;
      }
    }
  }

  /* 🌸 Dots Indicator */
  .carousel-dots {
    margin-top: 1.2rem;

    .dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      margin: 0 5px;
      border-radius: 50%;
      background: #d1b3ff;
      transition: 0.3s;
      cursor: pointer;

      &.active {
        background: #845ef7;
        transform: scale(1.2);
        box-shadow: 0 0 6px rgba(132, 94, 247, 0.5);
      }
    }
  }

  /* ✨ Scroll Fade-in */
  opacity: 0;
  transform: translateY(60px);
  transition: all 0.9s ease-out;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 💻 Laptop View */
@media (min-width: 992px) {
  .testimonial-card {
    flex: 0 0 30%;
    max-width: 320px;
    padding: 1.5rem;
    .review-text {
      font-size: 1rem;
    }
  }
}

/* 📱 Tablet View */
@media (max-width: 768px) {
  .testimonial-card {
    flex: 0 0 85%;
    max-width: 280px;
    padding: 1.2rem 1rem;
    .reviewer-img {
      width: 60px;
      height: 60px;
    }
    .review-text {
      font-size: 0.9rem;
    }
    .reviewer-info h5 {
      font-size: 0.95rem;
    }
    .reviewer-info span {
      font-size: 0.8rem;
    }
  }
}

/* 📱 Small Mobile View */
@media (max-width: 480px) {
  .testimonial-card {
    flex: 0 0 90%;
    max-width: 310px;
    padding: 1rem 0.8rem;
    .reviewer-img {
      width: 55px;
      height: 55px;
    }
    .review-text {
      font-size: 0.85rem;
    }
    .reviewer-info h5 {
      font-size: 0.9rem;
    }
    .reviewer-info span {
      font-size: 0.75rem;
    }
    .stars {
      font-size: 0.9rem;
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
