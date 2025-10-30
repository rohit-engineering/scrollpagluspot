<template>
  <div v-if="loading" class="text-center py-5">
    <div class="spinner-border text-pink" style="width: 3rem; height: 3rem;" role="status"></div>
    <p class="mt-3 fw-semibold text-muted">Fetching your exclusive item ✨...</p>
  </div>

  <div v-else-if="error" class="text-center py-5 text-danger fw-semibold">
    Oops! Something went wrong 😢<br />
    <small>{{ error }}</small>
  </div>

  <div v-else class="product-details container py-5">
    <div class="row align-items-center g-4">
      <!-- 🖼 Image Carousel -->
      <div class="col-lg-6 col-md-12">
        <div id="productCarousel" class="carousel slide rounded-4 shadow-lg overflow-hidden" data-bs-ride="carousel">
          <div class="carousel-inner">
            <div
              v-for="(img, i) in images"
              :key="i"
              class="carousel-item"
              :class="{ active: i === 0 }"
            >
              <img
                :src="img"
                class="d-block w-100 product-image"
                alt="Product Image"
                @error="(e) => e.target.src = fallbackImage"
              />
            </div>
          </div>

          <button class="carousel-control-prev" type="button" data-bs-target="#productCarousel" data-bs-slide="prev">
            <i class="bi bi-chevron-left text-dark fs-4"></i>
          </button>
          <button class="carousel-control-next" type="button" data-bs-target="#productCarousel" data-bs-slide="next">
            <i class="bi bi-chevron-right text-dark fs-4"></i>
          </button>
        </div>
      </div>

      <!-- 💖 Product Info -->
      <div class="col-lg-6 col-md-12">
        <div class="info-card p-4 rounded-4 shadow-sm bg-white bg-opacity-75">
          <h2 class="fw-bold mb-2 text-dark">{{ product.title }}</h2>
          <p class="text-muted small mb-2">{{ product.category }}</p>

          <div class="trust-badges d-flex align-items-center gap-2 mb-3 flex-wrap">
            <span class="badge rounded-pill bg-success-subtle text-success">✨ Verified Seller</span>
            <span class="badge rounded-pill bg-warning-subtle text-warning">💯 100% Authentic</span>
            <span class="badge rounded-pill bg-info-subtle text-info">🚚 Free Delivery</span>
          </div>

          <h4 class="text-pink fw-bold mb-3">₹{{ product.price?.toFixed(2) }}</h4>
          <p class="text-secondary mb-4 lh-lg">{{ product.description }}</p>

          <!-- 🌈 Marketing Pitch -->
          <transition name="pop">
            <div v-if="product.marketing_pitch" class="marketing-pitch mt-3 text-center">
              <p class="fw-semibold">
                <i class="bi bi-stars text-warning me-2"></i>
                {{ product.marketing_pitch }}
                <i class="bi bi-stars text-warning ms-2"></i>
              </p>
            </div>
          </transition>

          <!-- 💬 Customer Reactions -->
          <div class="reaction-container mt-4 text-center">
            <transition name="fade">
              <p key="reaction" class="reaction-text fw-semibold">
                {{ currentReaction }}
              </p>
            </transition>
          </div>

          <div class="d-flex align-items-center gap-3 flex-wrap mt-4 justify-content-center justify-content-lg-start">
            <button class="btn btn-cart" @click="addProductToCart(product)">
              <i class="bi bi-bag-heart-fill me-2"></i> Add to Cart
            </button>
            <button class="btn btn-outline-dark rounded-pill px-4 py-2" @click="goBack">
              <i class="bi bi-arrow-left-circle"></i> Back
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 💬 Toast Notification -->
    <transition name="fade">
      <div v-if="showToast" class="toast-msg position-fixed bottom-0 end-0 m-4 p-3 shadow">
        <i class="bi bi-cart-check-fill me-2"></i>{{ toastMessage }}
      </div>
    </transition>

    <!-- 🪄 Cute Ending Animation -->
    <div class="text-center mt-5 special-coming">
      <p class="fw-semibold text-muted">🌈 Something magical is coming soon...</p>
      <div class="loading-stars">
        <i class="bi bi-stars"></i>
        <i class="bi bi-heart"></i>
        <i class="bi bi-moon"></i>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../composables/useSupabase'
import { useCart } from '../composables/useCart'

const route = useRoute()
const router = useRouter()
const { addToCart } = useCart()

const product = ref({})
const images = ref([])
const loading = ref(true)
const error = ref(null)
const showToast = ref(false)
const toastMessage = ref('')
const fallbackImage = 'https://cdn-icons-png.flaticon.com/512/616/616408.png'

// 💬 GenZ-style customer reactions
const reactions = [
  "🔥 This item is trending on #ShopTok!",
  "💅 Bought by 300+ GenZ shoppers this week!",
  "🌸 Best aesthetic pick — totally worth it!",
  "🛍️ Just restocked, don’t miss the vibe!",
  "💖 97% buyers said ‘It’s a total slay’",
  "✨ Unboxing feels like magic — trust us!"
]
const currentReaction = ref(reactions[0])
let reactionInterval = null

onMounted(async () => {
  const id = route.params.id
  try {
    const { data, error: err } = await supabase.from('products').select('*').eq('id', id).single()
    if (err) throw err
    product.value = data
    images.value = [data.image1, data.image2, data.image3, data.image4, data.image5].filter(Boolean)
  } catch (err) {
    console.error(err)
    error.value = err.message || 'Something went wrong'
  } finally {
    loading.value = false
  }

  // 🔄 Rotate customer reactions every 3s
  let i = 0
  reactionInterval = setInterval(() => {
    i = (i + 1) % reactions.length
    currentReaction.value = reactions[i]
  }, 3000)
})

onUnmounted(() => {
  if (reactionInterval) clearInterval(reactionInterval)
})

const addProductToCart = (product) => {
  addToCart(product)
  toastMessage.value = `${product.title} added to cart 💕`
  showToast.value = true
  setTimeout(() => (showToast.value = false), 2500)
}

const goBack = () => router.back()
</script>

<style scoped lang="scss">
.text-pink { color: #ff6f91; }
.spinner-border.text-pink {
  border-color: #ff6f91;
  border-right-color: transparent;
}

.product-details {
  animation: fadeIn 0.4s ease;
  background: linear-gradient(180deg, #fff0f5, #ffe4f0);
  border-radius: 20px;
}

.product-image {
  width: 100%;
  height: 380px;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.product-image:hover {
  transform: scale(1.03);
}

.info-card {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #f3d7e1;
  box-shadow: 0 4px 20px rgba(255, 111, 181, 0.1);
}

/* 🌈 Marketing Pitch */
.marketing-pitch {
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(90deg, #ff9a9e, #fad0c4);
  border-radius: 15px;
  padding: 10px 15px;
  color: #fff;
  font-size: 1rem;
  animation: glow 2s infinite alternate;
}
@keyframes glow {
  0% { box-shadow: 0 0 8px rgba(255, 107, 203, 0.4); }
  100% { box-shadow: 0 0 18px rgba(255, 107, 203, 0.8); }
}

/* 💬 Rotating Reactions */
.reaction-text {
  font-size: 1rem;
  color: #555;
  animation: fadeInOut 3s infinite;
}
@keyframes fadeInOut {
  0%, 100% { opacity: 0; transform: translateY(10px); }
  25%, 75% { opacity: 1; transform: translateY(0); }
}

/* Buttons */
.btn-cart {
  background: linear-gradient(90deg, #ff9a9e, #fad0c4);
  border: none;
  border-radius: 25px;
  color: #333;
  font-weight: 600;
  padding: 10px 20px;
  transition: all 0.3s ease;
  &:hover {
    background: linear-gradient(90deg, #ff758c, #ff7eb3);
    color: white;
    transform: translateY(-2px) scale(1.05);
  }
}

/* Toast */
.toast-msg {
  background: #ff6f91;
  color: white;
  border-radius: 20px;
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1500;
  animation: popUp 0.4s ease;
}

/* Cute Ending Animation */
.special-coming .loading-stars i {
  font-size: 1.5rem;
  margin: 0 5px;
  color: #ff6f91;
  animation: twinkle 1.6s infinite ease-in-out alternate;
}
@keyframes twinkle {
  0% { opacity: 0.3; transform: scale(0.9); }
  100% { opacity: 1; transform: scale(1.1); }
}

/* Transitions */
@keyframes popUp {
  from { transform: translateY(50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Responsive */
@media (max-width: 768px) {
  .product-image {
    height: 260px;
  }
  .info-card {
    text-align: center;
    padding: 1.5rem;
  }
  .btn-cart {
    width: 100%;
  }
}
</style>
