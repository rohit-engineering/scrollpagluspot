// src/composables/useCart.js
import { ref, watchEffect, onMounted, onUnmounted } from 'vue'
import { supabase } from './useSupabase'
import { useAuth } from './useSupabase'

const cart = ref([])
let cartChannel = null // keep track of realtime channel

export function useCart() {
  const { user } = useAuth()
  const cartCount = ref(0)

  // ✅ Fetch cart for logged-in user
  const fetchCart = async () => {
    if (!user.value) {
      cart.value = []
      return
    }

    const { data, error } = await supabase
      .from('cart')
      .select('*')
      .eq('user_id', user.value.id)
      .order('inserted_at', { ascending: false })

    if (!error && data) cart.value = data
  }

  // ✅ Realtime subscription
  const subscribeToCartChanges = () => {
    if (!user.value) return

    // Unsubscribe old channel if exists
    if (cartChannel) supabase.removeChannel(cartChannel)

    cartChannel = supabase
      .channel('cart-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'cart', filter: `user_id=eq.${user.value.id}` },
        (payload) => {
          console.log('🔄 Cart change detected:', payload)
          fetchCart() // refetch on any change
        }
      )
      .subscribe((status) => {
        console.log('🧠 Realtime status:', status)
      })
  }

  // ✅ Add item
  const addToCart = async (product) => {
    if (!user.value) {
      alert('Please login to add items to your cart 🛒')
      return
    }

    const existing = cart.value.find((i) => i.product_id === product.id)
    if (existing) {
      await supabase
        .from('cart')
        .update({ quantity: existing.quantity + 1 })
        .eq('id', existing.id)
    } else {
      await supabase.from('cart').insert([
        {
          user_id: user.value.id,
          product_id: product.id,
          title: product.title,
          price: product.price,
          image1: product.image1,
          category: product.category,
          quantity: 1
        }
      ])
    }
  }

  // ✅ Remove item
  const removeFromCart = async (id) => {
    if (!user.value) return
    await supabase.from('cart').delete().eq('id', id)
  }

  // ✅ Update quantity
  const updateQuantity = async (id, newQty) => {
    if (!user.value) return
    if (newQty < 1) {
      await removeFromCart(id)
      return
    }
    await supabase.from('cart').update({ quantity: newQty }).eq('id', id)
  }

  // ✅ Keep count reactive
  watchEffect(() => {
    cartCount.value = cart.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // ✅ Auto setup when user logs in
  watchEffect(() => {
    if (user.value) {
      fetchCart()
      subscribeToCartChanges()
    } else {
      cart.value = []
      if (cartChannel) supabase.removeChannel(cartChannel)
    }
  })

  // Cleanup when component unmounts (avoid memory leaks)
  onUnmounted(() => {
    if (cartChannel) supabase.removeChannel(cartChannel)
  })

  return {
    cart,
    cartCount,
    addToCart,
    removeFromCart,
    updateQuantity,
    fetchCart
  }
}
