<template>
  <div class="product-card card shadow-sm h-100 position-relative">
    <!-- 🖼️ Product Image -->
    <div class="image-container">
      <img
        v-if="product.image1 && !imgError"
        :src="product.image1"
        alt="Product Image"
        class="card-img-top fade-in"
        loading="lazy"
        @error="imgError = true"
      />

      <!-- ✨ Cute loader when image missing -->
      <div v-else class="placeholder d-flex flex-column align-items-center justify-content-center">
        <div class="cute-loader">
          <div class="eye"></div>
          <div class="eye"></div>
          <div class="smile"></div>
        </div>
        <small class="text-secondary mt-2">Loading your vibe 💫</small>
      </div>

      <span class="trust-tag">
        <i class="bi bi-shield-check"></i> Verified
      </span>
    </div>

    <!-- 📦 Product Info -->
    <div class="card-body text-center">
      <h5 class="fw-semibold mb-1 text-dark product-name">{{ product.title }}</h5>
      <p class="text-muted small mb-1">{{ product.category }}</p>

      <div class="price-zone mb-3">
        <p class="price fw-bold mb-0">₹{{ product.price }}</p>
        <small class="text-success">
          <i class="bi bi-patch-check-fill"></i> Secure Price ✨
        </small>
      </div>

      <!-- 🎮 Action Buttons -->
      <div class="d-flex justify-content-center gap-2 mt-2 flex-wrap">
        <button class="btn btn-cart d-flex align-items-center gap-2" @click="handleAddToCart(product)">
          <i class="bi bi-bag-heart-fill"></i> Add
        </button>

        <!-- 👀 Animated Eye Button -->
        <router-link :to="`/product/${product.id}`" class="btn btn-view d-flex align-items-center gap-2">
          <div class="eyes">
            <div class="eye"></div>
            <div class="eye"></div>
          </div>
          <span>View</span>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCart } from '@/composables/useCart'
import { useAuth } from '@/composables/useSupabase'
import { toast } from 'vue3-toastify'

const { addToCart } = useCart()
const { user } = useAuth()
const imgError = ref(false)

const props = defineProps({
  product: Object
})

const handleAddToCart = async (product) => {
  if (!user.value) {
    toast.warning('Please log in to add items to your cart 💫')
    return
  }

  await addToCart(product)
  toast.success('🛍️ Added to your cart — your vibe upgraded ✨')
}
</script>

<style scoped lang="scss">
.product-card {
  border: none;
  border-radius: 1.2rem;
  background: #fff;
  transition: all 0.35s ease;
  overflow: hidden;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 10px 25px rgba(255, 182, 193, 0.35);
  }

  .image-container {
    width: 100%;
    height: 260px;
    background: linear-gradient(135deg, #fef6ff, #fff0f5);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-top-left-radius: 1.2rem;
      border-top-right-radius: 1.2rem;
      transition: transform 0.5s ease;
    }

    img:hover {
      transform: scale(1.07);
    }

    .placeholder {
      width: 100%;
      height: 100%;
      background: #fdf2f8;
      border-top-left-radius: 1.2rem;
      border-top-right-radius: 1.2rem;
    }

    /* 🩷 Cute face loader */
    .cute-loader {
      position: relative;
      width: 50px;
      height: 40px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      animation: float 1.6s ease-in-out infinite;

      .eye {
        width: 10px;
        height: 10px;
        background: #ff7eb3;
        border-radius: 50%;
        animation: blink 2s infinite;
      }

      .smile {
        position: absolute;
        bottom: 5px;
        width: 25px;
        height: 12px;
        border: 2px solid #ff7eb3;
        border-top: none;
        border-radius: 0 0 25px 25px;
      }
    }

    .trust-tag {
      position: absolute;
      bottom: 10px;
      left: 10px;
      background: rgba(255, 255, 255, 0.9);
      color: #22c55e;
      font-size: 0.75rem;
      border-radius: 10px;
      padding: 4px 8px;
      display: flex;
      align-items: center;
      gap: 4px;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px) scale(1.05);
      }
    }
  }

  .card-body {
    padding: 1rem 0.8rem;

    .product-name {
      font-size: 1rem;
      line-height: 1.3;
    }

    .price-zone {
      .price {
        color: #ff6f91;
        font-size: 1.2rem;
      }
    }

    .btn {
      border-radius: 10px;
      font-weight: 500;
      padding: 8px 14px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      flex: 1;

      &.btn-cart {
        background: linear-gradient(90deg, #ff9a9e, #fad0c4);
        border: none;
        color: #333;
        box-shadow: 0 3px 10px rgba(255, 105, 180, 0.25);

        &:hover {
          background: linear-gradient(90deg, #ff758c, #ff7eb3);
          color: #fff;
          transform: translateY(-2px);
        }
      }

      &.btn-view {
        border: 2px solid #ffb6c1;
        background: #fff;
        color: #ff6f91;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;

        &:hover {
          background: #ffb6c1;
          color: #fff;
          transform: translateY(-2px);
        }

        .eyes {
          display: flex;
          gap: 3px;
          .eye {
            width: 8px;
            height: 8px;
            background: #ff6f91;
            border-radius: 50%;
            animation: eye-move 1.5s infinite ease-in-out;
          }
        }
      }
    }
  }
}

/* 📱 Mobile Optimization */
@media (max-width: 768px) {
  .product-card {
    border-radius: 16px;

    .image-container {
      height: 220px;
      img {
        object-fit: contain;
      }
    }

    .card-body {
      padding: 0.8rem;
    }

    .btn {
      font-size: 0.85rem;
      padding: 6px 10px;
    }
  }
}

/* ✨ Animations */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

@keyframes eye-move {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(3px); }
}
</style>
