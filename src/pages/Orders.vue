<template>
  <div class="orders-page container py-5">
    <h2 class="fw-bold text-center mb-4">
      <i class="bi bi-bag-heart-fill text-pink"></i> Your Orders 💖
    </h2>

    <!-- 🫶 Empty Orders -->
    <div v-if="groupedOrders.length === 0" class="text-center py-5">
      <img
        src="https://cdn-icons-png.flaticon.com/512/2038/2038854.png"
        alt="Empty Orders"
        class="empty-img mb-3"
      />
      <h5 class="text-muted mb-3">No orders yet 😢</h5>
      <router-link to="/shop" class="btn btn-dark rounded-pill px-4">
        Shop Now ✨
      </router-link>
    </div>

    <!-- 📦 Orders List -->
    <transition-group name="fade" tag="div" v-else class="row g-4">
      <div
        v-for="(group, index) in groupedOrders"
        :key="index"
        class="col-12 d-flex justify-content-center"
      >
        <div class="card order-card shadow-sm border-0 rounded-4 p-3 w-100">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-bold mb-0">
              🛍️ Order Batch — {{ formatDate(group.date) }}
            </h5>

            <!-- 🗑️ Delete icon -->
            <button
              v-if="canDeleteGroup(group.orders)"
              class="btn btn-sm btn-outline-danger rounded-pill delete-btn"
              @click="confirmDeleteGroup(group.orders)"
            >
              <i class="bi bi-trash3"></i> Delete History
            </button>
          </div>

          <div
            v-for="order in group.orders"
            :key="order.id"
            class="border rounded-3 p-3 mb-2 bg-white bg-opacity-75"
          >
            <div class="row align-items-center">
              <div class="col-md-8 col-12">
                <h6 class="fw-bold mb-1 text-truncate">{{ order.item }}</h6>
                <p class="text-muted small mb-1">{{ order.category }}</p>
                <p class="fw-semibold mb-1">Qty: {{ order.quantity }}</p>
                <p class="text-success fw-bold mb-1">
                  ₹{{ order.total_amount.toFixed(2) }}
                </p>

                <!-- 🚚 Tracking Status -->
                <div class="tracking-status mt-1">
                  <div
                    :class="['status-dot', order.status]"
                    :title="order.status"
                  ></div>
                  <span class="status-text ms-2 fw-semibold text-capitalize">
                    {{ order.status }}
                  </span>
                </div>
              </div>

              <div
                class="col-md-4 col-12 d-flex flex-column align-items-end justify-content-center text-end"
              >
                <button
                  class="btn btn-outline-dark btn-sm rounded-pill"
                  @click="downloadReceipt(order)"
                >
                  ⬇️ Download Bill
                </button>
              </div>
            </div>
          </div>

          <div class="text-end mt-3">
            <strong>Total (Batch): ₹{{ totalForGroup(group.orders).toFixed(2) }}</strong>
          </div>
        </div>
      </div>
    </transition-group>

    <!-- Hidden template for PDF -->
    <div id="order-receipt" style="display: none;">
      <div class="receipt-box">
        <img
          src="https://cdn-icons-png.flaticon.com/512/1049/1049329.png"
          alt="Logo"
          class="logo mb-3"
        />
        <h2 class="text-pink fw-bold mb-3">GenZ Shop Receipt 💖</h2>

        <p><b>Name:</b> {{ userName }}</p>
        <p><b>Email:</b> {{ userEmail }}</p>

        <table class="table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="o in pdfItems" :key="o.item">
              <td>{{ o.item }}</td>
              <td>{{ o.category }}</td>
              <td>{{ o.quantity }}</td>
              <td>₹{{ o.total_amount.toFixed(2) }}</td>
            </tr>
          </tbody>
        </table>

        <h4 class="mt-3">Grand Total: ₹{{ pdfTotal.toFixed(2) }}</h4>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { supabase } from '../composables/useSupabase'
import { useToast } from 'vue-toastification'
import html2pdf from 'html2pdf.js'
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'

const toast = useToast()
const orders = ref([])
const userName = ref('')
const userEmail = ref('')
const pdfItems = ref([])
const pdfTotal = ref(0)
let ordersChannel = null

// 🔹 Ask for notification permission
const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
}

// 🔹 Send browser notification
const showDesktopNotification = (title, message) => {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: message,
      icon: 'https://cdn-icons-png.flaticon.com/512/1049/1049329.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/1049/1049329.png'
    })
  } else {
    toast.info(message)
  }
}

// 🔹 Fetch orders
const fetchOrders = async () => {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) {
    toast.error('Please login to view your orders 🚪')
    return
  }

  userEmail.value = user.email
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('order_date', { ascending: false })

  if (error) {
    console.error(error)
    toast.error('Failed to fetch orders ❌')
    return
  }

  if (data.length > 0) userName.value = data[0].name
  orders.value = data
}

// 🔹 Group orders by checkout time (1-min batches)
const groupedOrders = computed(() => {
  const groups = []
  orders.value.forEach((order) => {
    const dateKey = new Date(order.order_date)
      .toISOString()
      .slice(0, 16)
    let group = groups.find((g) => g.key === dateKey)
    if (!group) {
      group = { key: dateKey, date: order.order_date, orders: [] }
      groups.push(group)
    }
    group.orders.push(order)
  })
  return groups
})

// 🔹 Helpers
const totalForGroup = (orders) =>
  orders.reduce((sum, o) => sum + o.total_amount, 0)

const canDeleteGroup = (orders) =>
  orders.length > 0 &&
  orders.every((o) => ['delivered', 'cancelled'].includes(o.status))

// 🔹 SweetAlert2 Confirmation Modal
const confirmDeleteGroup = async (ordersToDelete) => {
  const result = await Swal.fire({
    title: 'Delete this order history?',
    text: 'Once deleted, it cannot be recovered!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ff6f91',
    cancelButtonColor: '#6c757d',
    confirmButtonText: 'Yes, delete it ✨',
    background: 'rgba(255,255,255,0.95)',
    backdrop: `rgba(255,111,145,0.2)`,
    customClass: { popup: 'rounded-4 shadow-lg' }
  })

  if (result.isConfirmed) {
    await deleteOrderGroup(ordersToDelete)
  }
}

// 🔹 Delete
const deleteOrderGroup = async (ordersToDelete) => {
  const ids = ordersToDelete.map((o) => o.id)
  const { error } = await supabase.from('orders').delete().in('id', ids)
  if (error) {
    toast.error('Failed to delete history ❌')
  } else {
    toast.success('History deleted successfully 🧹')
    await fetchOrders()
  }
}

// 🔹 Realtime updates with Desktop Notification
const subscribeToRealtimeOrders = async () => {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) return

  if (ordersChannel) supabase.removeChannel(ordersChannel)

  ordersChannel = supabase
    .channel('orders-realtime')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${user.id}` },
      (payload) => {
        if (payload.eventType === 'UPDATE') {
          const message = `Order "${payload.new.item}" status changed to "${payload.new.status}" 💫`
          toast.info(message)
          showDesktopNotification('Order Update 💖', message)
        }
        fetchOrders()
      }
    )
    .subscribe()
}

const formatDate = (dateStr) => new Date(dateStr).toLocaleString()

const downloadReceipt = async (order) => {
  pdfItems.value = [order]
  pdfTotal.value = order.total_amount

  const element = document.getElementById('order-receipt')
  element.style.display = 'block'

  const opt = {
    margin: 0.5,
    filename: `GenZ_Order_${order.id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
  }

  html2pdf().from(element).set(opt).save().then(() => {
    element.style.display = 'none'
  })
}

onMounted(async () => {
  await requestNotificationPermission()
  await fetchOrders()
  await subscribeToRealtimeOrders()
})
onUnmounted(() => {
  if (ordersChannel) supabase.removeChannel(ordersChannel)
})
</script>

<style scoped>
.text-pink { color: #ff6f91; }
.order-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}
.order-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(255, 111, 181, 0.2);
}
.empty-img {
  width: 160px;
  opacity: 0.85;
  animation: float 3s ease-in-out infinite;
}
@keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)} }

.tracking-status { display: flex; align-items: center; }
.status-dot {
  width: 12px; height: 12px; border-radius: 50%; margin-right: 6px;
}
.status-dot.processing { background: #ffc107; }
.status-dot.shipped { background: #17a2b8; }
.status-dot.delivered { background: #28a745; }
.status-dot.cancelled { background: #dc3545; }

.delete-btn {
  font-size: 0.85rem;
  transition: all 0.2s;
}
.delete-btn:hover {
  background-color: #ff6f91;
  color: white;
}

.receipt-box {
  background: white;
  border: 2px solid #ffb6c1;
  border-radius: 15px;
  padding: 20px;
  text-align: center;
}
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  border: 1px solid #ffd5e4;
  padding: 8px;
  text-align: center;
}
.table th { background: #ffe6ef; color: #ff4d94; }
</style>
