import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import Shop from '../pages/Shop.vue'
import Cart from '../pages/Cart.vue'
import Checkout from '../pages/Checkout.vue'
import Orders from '../pages/Orders.vue'
import Profile from '../pages/Profile.vue'
import Login from '../pages/Login.vue'
import Signup from '../pages/Signup.vue'
import ProductDetails from '../pages/ProductDetails.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/shop', component: Shop },
  { path: '/profile', component: Profile },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/product/:id', component: ProductDetails },
  { path: '/cart', component: Cart, meta: { requiresAuth: true } },
  { path: '/orders', component: Orders, meta: { requiresAuth: true } },
  { path: '/checkout', component: Checkout, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
