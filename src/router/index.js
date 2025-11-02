import { createRouter, createWebHistory } from 'vue-router'

// ✅ Lazy-loaded routes (only loads when user visits the page)
const Home = () => import('../pages/Home.vue')
const Shop = () => import('../pages/Shop.vue')
const Cart = () => import('../pages/Cart.vue')
const Checkout = () => import('../pages/Checkout.vue')
const Orders = () => import('../pages/Orders.vue')
const Profile = () => import('../pages/Profile.vue')
const Login = () => import('../pages/Login.vue')
const Signup = () => import('../pages/Signup.vue')
const Explore = () => import('../pages/explore.vue')
const Notifications = () => import('../pages/Notifications.vue')
const ProductDetails = () => import('../pages/ProductDetails.vue')

const routes = [
  { path: '/', component: Home },
  { path: '/shop', component: Shop },
  { path: '/profile', component: Profile },
  { path: '/login', component: Login },
  { path: '/signup', component: Signup },
  { path: '/explore', component: Explore },
  { path: '/notifications', component: Notifications },
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
