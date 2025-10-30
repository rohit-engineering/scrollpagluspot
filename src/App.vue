<template>
  <div class="app-wrapper">
    <!-- Toast container for custom toasts -->
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
      <div id="mainToast" class="toast align-items-center text-white border-0" role="alert">
        <div class="d-flex">
          <div class="toast-body" id="toastMessage"></div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
      </div>
    </div>
    <!---end---->
    <Navbar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import Navbar from './components/Navbar.vue'
export default { components: { Navbar } }
</script>

<style>

/* 🌈 GenZ Toast Styling */
.genz-toast {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 182, 193, 0.4);
  border-radius: 16px !important;
  color: #ff6f91 !important;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 6px 20px rgba(255, 111, 181, 0.25);
  font-family: 'Poppins', sans-serif;
}

/* 🔝 Top spacing for mobile */
.Vue-Toastification__container--top-center {
  top: 10px !important;
  padding-top: env(safe-area-inset-top, 10px);
}

/* 💫 Cute pop animation */
@media (max-width: 768px) {
  .Vue-Toastification__toast {
    animation: bounceInDown 0.5s ease;
  }

  @keyframes bounceInDown {
    0% {
      opacity: 0;
      transform: translateY(-40px);
    }
    60% {
      opacity: 1;
      transform: translateY(10px);
    }
    100% {
      transform: translateY(0);
    }
  }
}


.app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Give space for floating quickbar */
.main-content {
  flex: 1;
  padding-bottom: 35px;
}

/* Toast style */
.cute-toast {
  position: fixed;
  top: 10px;
  right: 20px;
  background: linear-gradient(90deg, #845ef7, #ff6bcb);
  color: white;
  padding: 10px 20px;
  border-radius: 25px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: fadeInOut 2s ease;
  z-index: 3000;
}
.cute-toast.warning {
  background: linear-gradient(90deg, #ff6bcb, #ffa8b8);
}
@keyframes fadeInOut {
  0% { opacity: 0; transform: translateY(20px); }
  10%, 90% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(20px); }
}
</style>
