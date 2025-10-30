<template>
  <div class="shop-page container py-5">
    <h2 class="fw-bold mb-4 text-center text-pink">
      <i class="bi bi-bag-heart-fill text-pink"></i> Shop The Vibe ✨
    </h2>

    <!-- 🌈 Filter & Sort Bar -->
    <div class="filter-bar d-flex flex-wrap justify-content-center align-items-center gap-3 mb-5 p-3 rounded-4 shadow-sm">
      <div class="filter-item d-flex align-items-center gap-2">
        <i class="bi bi-funnel-fill text-pink"></i>
        <select v-model="selectedCategory" class="form-select fw-semibold filter-select">
          <option value="">All Categories</option>
          <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </div>

      <div class="filter-item d-flex align-items-center gap-2">
        <i class="bi bi-sort-down text-pink"></i>
        <select v-model="sortOption" class="form-select fw-semibold filter-select">
          <option value="default">Sort by Default</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
          <option value="name">Name (A-Z)</option>
        </select>
      </div>

      <div class="filter-item search-bar d-flex align-items-center px-3 rounded-pill shadow-sm">
        <i class="bi bi-search text-pink"></i>
        <input
          v-model="searchQuery"
          class="form-control border-0 bg-transparent fw-semibold"
          placeholder="Search aesthetic..."
        />
      </div>
    </div>

    <!-- 🌀 Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-pink" style="width:3rem;height:3rem"></div>
      <p class="mt-3 fw-semibold text-muted">Fetching trendy GenZ picks...</p>
    </div>

    <!-- 🚫 Error -->
    <div v-else-if="error" class="text-center text-danger fw-semibold py-5">
      {{ error }}
    </div>

    <!-- 🛍️ Product Grid -->
    <div v-else class="row g-4 justify-content-center">
      <div
        v-for="product in filteredProducts"
        :key="product.id"
        class="col-lg-3 col-md-4 col-sm-6 col-10"
      >
        <div class="product-card card h-100 shadow-sm border-0">
          <div class="image-container position-relative">
            <img
              :src="product.image1"
              class="card-img-top"
              alt="Product"
              @error="e => e.target.src = 'https://cdn-icons-png.flaticon.com/512/679/679922.png'"
            />
          </div>

          <div class="card-body d-flex flex-column justify-content-between">
            <h6 class="fw-bold text-dark mb-1">{{ product.title }}</h6>
            <p class="text-muted small mb-2">{{ product.category }}</p>
            <p class="fw-semibold text-success mb-3">₹{{ product.price.toFixed(2) }}</p>

            <div class="d-flex justify-content-between">
              <button
                class="btn btn-outline-dark btn-sm rounded-pill flex-grow-1 me-2 view-btn"
                @click="viewProduct(product.id)"
              >
                👁️ View
              </button>

              <button
                class="btn btn-dark btn-sm rounded-pill flex-grow-1 add-btn"
                @click="addProductToCart(product)"
              >
                🛒 Add
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ✨ End Message -->
      <div class="col-12 text-center mt-5 cute-end-message">
        <div class="floating-icons">
          <span
            v-for="(icon, i) in cuteIcons"
            :key="i"
            class="floating-icon"
            :style="icon.style"
          >
            {{ icon.symbol }}
          </span>
        </div>
        <div class="sparkle-loader">
          <i class="bi bi-stars fs-3 text-pink"></i>
          <i class="bi bi-stars fs-4 text-pink ms-2"></i>
          <i class="bi bi-stars fs-3 text-pink ms-2"></i>
        </div>
        <p class="mt-3 fw-semibold text-muted">
          🌸 More aesthetic drops arriving soon... stay tuned 💖
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { supabase } from '../composables/useSupabase'
import { useCart } from '../composables/useCart'

const router = useRouter()
const { addToCart } = useCart()
const toast = useToast()

const products = ref([])
const categories = ref([])
const selectedCategory = ref('')
const sortOption = ref('default')
const searchQuery = ref('')
const loading = ref(true)
const error = ref(null)
const cuteIcons = ref([])

const generateCuteIcons = () => {
  const symbols = ['🌸', '💎', '🦋', '✨', '💖', '🌷', '🌈']
  cuteIcons.value = Array.from({ length: 12 }).map(() => ({
    symbol: symbols[Math.floor(Math.random() * symbols.length)],
    style: {
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 3}s`,
      animationDuration: `${3 + Math.random() * 3}s`,
    },
  }))
}

onMounted(async () => {
  try {
    const { data, error: err } = await supabase.from('products').select('*')
    if (err) throw err
    products.value = data || []
    categories.value = [...new Set(data.map(p => p.category))].filter(Boolean)
  } catch (err) {
    error.value = err.message || 'Failed to fetch products.'
  } finally {
    loading.value = false
    generateCuteIcons()
  }
})

const filteredProducts = computed(() => {
  let result = [...products.value]

  if (selectedCategory.value)
    result = result.filter(p => p.category === selectedCategory.value)

  if (searchQuery.value)
    result = result.filter(p =>
      p.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    )

  if (sortOption.value === 'low') result.sort((a, b) => a.price - b.price)
  else if (sortOption.value === 'high') result.sort((a, b) => b.price - a.price)
  else if (sortOption.value === 'name') result.sort((a, b) => a.title.localeCompare(b.title))

  return result
})

const addProductToCart = async (product) => {
  await addToCart(product)
  toast.success(`🛒 ${product.title} added to cart! 💖`)
}

const viewProduct = (id) => {
  router.push(`/product/${id}`)
}
</script>

<style scoped>
.text-pink { color: #ff6f91; }

.filter-bar {
  background: linear-gradient(90deg, #ffe5ec, #ffd1dc);
  border: 2px solid #ffc1cc;
  border-radius: 25px;
  transition: 0.4s;
}
.filter-bar:hover { transform: scale(1.01); }
.filter-item select, .search-bar input {
  border: none;
  background: transparent;
  outline: none;
}
.filter-select {
  border-radius: 50px;
  padding: 0.4rem 1rem;
}
.search-bar {
  background: white;
  border: 1px solid #ffb6c1;
}

.product-card {
  border-radius: 20px;
  background: #fffafc;
  transition: 0.3s ease;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(255,111,181,0.25);
}
.image-container {
  height: 240px;
  background: #fff0f5;
  overflow: hidden;
}
.image-container img {
  height: 100%;
  width: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.image-container:hover img { transform: scale(1.06); }

/* ✨ Floating Icons */
.floating-icons { position: relative; height: 100px; }
.floating-icon {
  position: absolute;
  bottom: 0;
  font-size: 1.3rem;
  opacity: 0.8;
  animation: floatUp 5s infinite ease-in-out;
}
@keyframes floatUp {
  0% { transform: translateY(0); opacity: 0.8; }
  50% { transform: translateY(-40px); opacity: 1; }
  100% { transform: translateY(-80px); opacity: 0; }
}
</style>
