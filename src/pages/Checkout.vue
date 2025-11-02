<template>
  <div class="checkout-page container py-5">
    <h2 class="fw-bold text-center mb-4">
      <i class="bi bi-bag-check-fill text-pink"></i> Checkout 💳
    </h2>

    <!-- ✅ Thank You Section -->
    <div v-if="orderPlaced" class="thankyou-section text-center py-5">
      <div class="thankyou-animation mb-4">✨</div>
      <h3 class="fw-bold text-success mb-3">🎉 Thank You, {{ name }}!</h3>
      <p class="text-muted mb-4">
        Your order has been placed successfully.<br />
        Please complete payment to confirm your order.
      </p>

      <div class="upi-banner p-4 rounded-4 mb-4">
        <h6 class="fw-bold text-dark mb-2">⚡ Important Payment Instructions</h6>
        <p>Send payment of <b>₹{{ totalAmount.toFixed(2) }}</b> to this UPI ID:</p>
        <p class="fw-bold fs-5 text-dark">rohitkusv-1@oksbi</p>
        <img
          src="https://ensahgetpuripudypnsi.supabase.co/storage/v1/object/sign/products/googlepay.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYzY4MWJiMC0wZTM4LTQ0OWQtOThhNC1mOGE3ZmQ4ODc2MmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9nb29nbGVwYXkuanBnIiwiaWF0IjoxNzYxNTkxMzg2LCJleHAiOjE3NjMzMTkzODZ9.nzXqG9MjCag9Cxruv-SoYyaYjYvYNlJM2ISYddBLfWw"
          alt="UPI QR Code"
          class="qr-code my-3"
        />
        <p class="small mb-1">
          ⚠️ After payment, send your payment screenshot & bill PDF to
          <b class="text-success">+91 7827411020</b> on WhatsApp 📲
        </p>
      </div>

      <button class="btn btn-dark rounded-pill px-5 py-2" @click="downloadBill">
        ⬇️ Download Receipt (PDF)
      </button>
    </div>

    <!-- 🧾 Checkout Form -->
    <form v-else @submit.prevent="placeOrder" class="checkout-form mx-auto shadow-lg rounded-4 p-4">
      <div class="row g-3">
        <div class="col-md-6">
          <label class="form-label">Full Name</label>
          <input v-model.trim="name" required class="form-control rounded-pill" />
        </div>

        <div class="col-md-6">
          <label class="form-label">Phone Number</label>
          <input v-model.trim="phone" required pattern="[0-9]{10}" maxlength="10" class="form-control rounded-pill" />
        </div>

        <div class="col-md-6">
          <label class="form-label">Email</label>
          <input type="email" v-model.trim="email" required class="form-control rounded-pill" />
        </div>

        <div class="col-md-6">
          <label class="form-label">Pincode</label>
          <input v-model.trim="pincode" required pattern="[0-9]{6}" maxlength="6" class="form-control rounded-pill" />
        </div>

        <div class="col-12">
          <label class="form-label">Full Address</label>
          <textarea v-model.trim="address" required class="form-control rounded-4" rows="3"></textarea>
        </div>
      </div>

      <div class="text-end mt-4">
        <button class="btn btn-dark rounded-pill px-5 py-2" type="submit">
          Place Order 🚀
        </button>
      </div>
    </form>

    <!-- 🧾 Hidden Receipt Template -->
    <div id="receipt-content" style="display:none;">
      <div class="receipt-box">
        <img
          src="https://ensahgetpuripudypnsi.supabase.co/storage/v1/object/sign/products/logo.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYzY4MWJiMC0wZTM4LTQ0OWQtOThhNC1mOGE3ZmQ4ODc2MmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9sb2dvLnBuZyIsImlhdCI6MTc2MTYzMTgxOCwiZXhwIjo0NTk5ODcxODE4fQ.iIpdHoKgMZhGjxZ9wc3TGQO3eZQs-dXjcXaATGhjOi4"
          alt="Logo"
          width="150"
          height="150"
          style="border-radius: 50%;"
          class="logo mb-3"
        />
        <h2 class="text-pink fw-bold mb-3">GenZ Shop Receipt 💖</h2>

        <p><b>Name:</b> {{ name }}</p>
        <p><b>Email:</b> {{ email }}</p>
        <p><b>Phone:</b> {{ phone }}</p>
        <p><b>Address:</b> {{ address }}, {{ pincode }}</p>
        <p><b>Date:</b> {{ new Date().toLocaleString() }}</p>

        <table class="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in orderDetails" :key="item.item">
              <td>{{ item.item }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.quantity }}</td>
              <td>₹{{ item.price }}</td>
              <td>₹{{ (item.price * item.quantity).toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <h4 class="mt-3">Grand Total: ₹{{ totalAmount.toFixed(2) }}</h4>

        <img
          src="https://ensahgetpuripudypnsi.supabase.co/storage/v1/object/sign/products/googlepay.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9lYzY4MWJiMC0wZTM4LTQ0OWQtOThhNC1mOGE3ZmQ4ODc2MmYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJwcm9kdWN0cy9nb29nbGVwYXkuanBnIiwiaWF0IjoxNzYxNTkxMzg2LCJleHAiOjE3NjMzMTkzODZ9.nzXqG9MjCag9Cxruv-SoYyaYjYvYNlJM2ISYddBLfWw"
          alt="UPI QR Code"
          class="qr-code mt-3"
        />
        <p class="mt-2">⚡ Pay via UPI: <b>rohitkusv-1@oksbi</b></p>
        <p class="small">Then WhatsApp payment screenshot & this bill to +91 7827411020 📲</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../composables/useSupabase'
import { useCart } from '../composables/useCart'
import { useToast } from 'vue-toastification'
import html2pdf from 'html2pdf.js'

const toast = useToast()
const { cart, fetchCart } = useCart()

const name = ref('')
const email = ref('')
const phone = ref('')
const address = ref('')
const pincode = ref('')
const orderPlaced = ref(false)
const totalAmount = ref(0)
const orderDetails = ref([])

// ✅ Custom Validation Function
const validateForm = () => {
  const nameRegex = /^[a-zA-Z\s]{3,40}$/
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const phoneRegex = /^[6-9]\d{9}$/
  const pincodeRegex = /^[1-9][0-9]{5}$/

  if (!name.value || !nameRegex.test(name.value)) {
    toast.error('Please enter a valid full name (only letters) 🙅‍♂️')
    return false
  }

  if (!emailRegex.test(email.value)) {
    toast.error('Enter a valid email address 📧')
    return false
  }

  if (!phoneRegex.test(phone.value)) {
    toast.error('Enter a valid 10-digit Indian phone number 📱')
    return false
  }

  // Prevent fake phone like "9999999999" or "1234567890"
  const fakeNumbers = ['1234567890', '9999999999', '8888888888', '0000000000']
  if (fakeNumbers.includes(phone.value)) {
    toast.error('Please enter a real phone number 🕵️‍♂️')
    return false
  }

  if (!pincodeRegex.test(pincode.value)) {
    toast.error('Enter a valid 6-digit Indian pincode 📮')
    return false
  }

  if (!address.value || address.value.length < 10) {
    toast.error('Please enter a full address (at least 10 characters) 🏠')
    return false
  }

  return true
}

const placeOrder = async () => {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  if (!user) {
    toast.error('Please login to place your order 🚪')
    return
  }

  if (cart.value.length === 0) {
    toast.warning('Your cart is empty 🛍️')
    return
  }

  // ✅ Check Validation
  if (!validateForm()) return

  totalAmount.value = cart.value.reduce((sum, i) => sum + i.price * i.quantity, 0)
  orderDetails.value = cart.value.map(i => ({
    item: i.title,
    category: i.category,
    quantity: i.quantity,
    price: i.price
  }))

  const orders = cart.value.map(i => ({
    user_id: user.id,
    product_id: i.id,
    item: i.title,
    category: i.category,
    quantity: i.quantity,
    name: name.value,
    email: email.value,
    phone: phone.value,
    address: address.value,
    pincode: pincode.value,
    total_amount: totalAmount.value,
    order_date: new Date().toISOString()
  }))

  const { error } = await supabase.from('orders').insert(orders)
  if (error) {
    toast.error('Error placing order ❌')
    console.error(error)
    return
  }

  await supabase.from('cart').delete().eq('user_id', user.id)
  await fetchCart()
  orderPlaced.value = true
  toast.success('Your order has been placed 🎉')
}

const downloadBill = () => {
  const element = document.getElementById('receipt-content')
  element.style.display = 'block'

  const opt = {
    margin: 0.5,
    filename: 'GenZ_Order_Receipt.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }

  html2pdf().from(element).set(opt).save().then(() => {
    element.style.display = 'none'
  })
}
</script>

<style scoped>
.text-pink {
  color: #ff6f91;
}
.checkout-form {
  max-width: 700px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
}
.form-control {
  border-radius: 30px !important;
  border: 1px solid #ffc1dc;
}
.upi-banner {
  background: rgba(255, 255, 255, 0.95);
  border: 2px dashed #ff6f91;
  backdrop-filter: blur(8px);
  animation: glow 2s infinite alternate;
}
@keyframes glow {
  from { box-shadow: 0 0 5px #ff6f91; }
  to { box-shadow: 0 0 20px #ff6f91; }
}
.thankyou-animation {
  font-size: 3rem;
  animation: sparkle 2s infinite alternate;
}
@keyframes sparkle {
  from { text-shadow: 0 0 10px #ffb6c1; }
  to { text-shadow: 0 0 25px #ff6f91; }
}
.receipt-box {
  width: 100%;
  max-width: 600px;
  margin: auto;
  padding: 20px;
  background: white;
  border: 2px solid #ffb6c1;
  border-radius: 15px;
  text-align: center;
  font-family: 'Poppins', sans-serif;
}
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
.table th,
.table td {
  border: 1px solid #ffd5e4;
  padding: 8px;
  text-align: center;
}
.table th {
  background-color: #ffe6ef;
  color: #ff4d94;
}
.qr-code {
  width: 120px;
  height: auto;
  display: block;
  margin: 10px auto;
}
</style>
