// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import './styles/main.scss'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import { VueQueryPlugin } from '@tanstack/vue-query'


const app = createApp(App)
app.use(router)
app.use(Toast, {
  position: 'top-center',  // 🌸 Move toast to top
  timeout: 2500,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  transition: 'Vue-Toastification__fade',
  maxToasts: 3,
  hideProgressBar: true,
  toastClassName: 'genz-toast'
})
app.use(VueQueryPlugin)
app.mount('#app')
