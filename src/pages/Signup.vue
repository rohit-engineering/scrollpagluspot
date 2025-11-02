<template>
  <div class="auth-page d-flex justify-content-center align-items-center">
    <div class="auth-card p-4" :class="{ 'shake-invalid': formInvalid }">
      <!-- Trust banner -->
      <div class="trust-badge mb-3">
        <i class="fas fa-shield-alt shield-icon"></i>
        <div class="trust-text">
          <strong>GenZ Verified</strong> — Secure & Authentic 💎
        </div>
      </div>

      <h3 class="auth-title">Create Your GenZ Account ✨</h3>
      <p class="auth-subtitle">Exclusive access for verified GenZ users — join the premium side!</p>

      <form @submit.prevent="onSignup" novalidate>
        <!-- Full Name -->
        <div class="mb-3">
          <label class="form-label">Full Name</label>
          <input
            v-model="full_name"
            @input="sanitizeName"
            :class="['form-control', { 'border-invalid': nameError, 'border-valid': !nameError && full_name }]"
            placeholder="John Doe"
            required
            autocomplete="name"
          />
          <small v-if="nameError" class="field-error">{{ nameError }}</small>
        </div>

        <!-- Phone -->
        <div class="mb-3">
          <label class="form-label">Phone</label>
          <input
            v-model="phone"
            @input="sanitizePhone"
            :class="['form-control', { 'border-invalid': phoneError, 'border-valid': !phoneError && phone }]"
            placeholder="1234567890"
            maxlength="15"
            inputmode="numeric"
            required
          />
          <small v-if="phoneError" class="field-error">{{ phoneError }}</small>
        </div>

        <!-- Email -->
        <div class="mb-3 email-field">
          <label class="form-label">Email</label>

          <div class="email-input-wrapper">
            <input
              v-model="email"
              type="email"
              class="form-control"
              placeholder="your@email.com"
              @input="validateEmail"
              required
              :class="{
                'border-checking': checkingEmail,
                'border-valid': emailValid && !checkingEmail,
                'border-invalid': !emailValid && !checkingEmail && emailMessage
              }"
            />
            <span
              class="email-status"
              :class="{
                checking: checkingEmail,
                valid: emailValid && !checkingEmail,
                invalid: !emailValid && !checkingEmail && emailMessage
              }"
            >
              <i v-if="checkingEmail" class="fas fa-spinner fa-spin"></i>
              <i v-else-if="emailValid" class="fas fa-check-circle"></i>
              <i v-else-if="!emailValid && emailMessage" class="fas fa-times-circle"></i>
            </span>
          </div>
          <p v-if="emailMessage" class="email-message" :class="{ valid: emailValid, invalid: !emailValid }">
            {{ emailMessage }}
          </p>
        </div>

        <!-- Password -->
        <div class="mb-3">
          <label class="form-label">Password</label>
          <input
            v-model="password"
            type="password"
            class="form-control"
            placeholder="••••••••"
            @input="validatePassword"
            required
          />
          <div class="password-rules">
            <div class="strength-bar">
              <div :class="['bar', passwordStrength]"></div>
            </div>
            <small :class="['password-hint', passwordStrength]">{{ passwordMessage }}</small>
          </div>
        </div>

        <!-- Submit -->
        <button :disabled="loading" class="btn btn-primary w-100 signup-btn">
          <span v-if="!loading">Sign Up Securely 🔒</span>
          <span v-else>Creating...</span>
        </button>
      </form>

      <p class="email-info mt-3 text-center">
        🛡️ Your data is encrypted & protected — GenZ Shop is a verified, scam-free zone!
      </p>

      <p class="mt-3 text-center">
        Already have an account?
        <router-link to="/login" class="link-gradient">Login</router-link>
      </p>
    </div>

    <!-- Thank You Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-emoji-runner">
          <span v-for="n in 12" :key="n" class="emoji">🎉</span>
        </div>
        <h2 class="modal-title">Thx for Signing Up! 💖</h2>
        <p class="modal-sub">Welcome to <strong>GenZ Shop</strong> — the verified hub for real ones 🔥</p>
        <div class="modal-actions">
          <button class="btn btn-primary" @click="continueToProfile">Go to My Profile</button>
          <button class="btn btn-link" @click="closeModal">Maybe Later</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useSupabase'
import { useToast } from 'vue-toastification'

// Utility: entropy score (rough measure of password complexity)
function passwordEntropy(pw) {
  const unique = new Set(pw).size
  return Math.log2(Math.pow(unique, pw.length))
}

// Utility: debounce
function debounce(fn, delay = 400) {
  let t
  return (...args) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), delay)
  }
}

// Local pattern sets
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', '10minutemail.com', 'tempmail.io', 'tempmail.com',
  'guerrillamail.com', 'yopmail.com', 'maildrop.cc', 'trashmail.com',
  'getnada.com', 'fakeinbox.com', 'spambog.com', 'dispostable.com',
  'example.com', 'test.com', 'example.org'
])
const SUSPICIOUS_LOCAL = [
  /^(test|asdf|user|sample|none|na|null|check|trial|demo|fake|xyz|test1|test2|test3|test4|gmail|hi|hello|fuck|chill|temp|user|sample|abc|admin|root|hello|hi|no[-_]?reply)[0-9._-]*$/i,
  /^[0-9]{5,}$/,
  /^([a-z0-9])\1{4,}$/i
]

export default {
  setup() {
    const router = useRouter()
    const { signup, user } = useAuth()
    const toast = useToast()

    const email = ref('')
    const password = ref('')
    const full_name = ref('')
    const phone = ref('')

    const loading = ref(false)
    const showModal = ref(false)
    const formInvalid = ref(false)

    const nameError = ref('')
    const phoneError = ref('')
    const emailValid = ref(false)
    const emailMessage = ref('')
    const checkingEmail = ref(false)

    const passwordStrength = ref('weak')
    const passwordMessage = ref('Must include letters, numbers, and be at least 6 chars.')

    onMounted(() => {
      if (user.value) router.push('/profile')
    })

 const sanitizeName = () => {
  // Clean input: keep only letters, spaces, hyphens, and apostrophes
  full_name.value = full_name.value.replace(/[^A-Za-z\s'-]/g, '').replace(/\s{2,}/g, ' ').trim()

  if (!full_name.value) {
    nameError.value = 'Please enter your name.'
    return
  }

  // Split into words
  const parts = full_name.value.split(' ').filter(Boolean)

  // Require at least 3 total characters in the whole name
  if (full_name.value.length < 3) {
    nameError.value = 'Name is too short.'
    return
  }

  // Disallow obviously fake or placeholder names
  const fakeNamePatterns = [
    /\b(test|demo|fake|abc|abcd|xyz|qwerty|asdf|user|sample|none|na|null|check|trial|hello|hi)\b/i,
    /^[a-z]{1,2}$/i, // single or double character names like "ab"
    /^([a-z])\1{2,}$/i, // repeated single char like "aaa"
  ]
  if (fakeNamePatterns.some(rx => rx.test(full_name.value))) {
    nameError.value = 'Please use a valid name.'
    return
  }

  // Optional: encourage full names (but not required)
  if (parts.length === 1 && full_name.value.length < 4) {
    nameError.value = 'Please enter a more complete name.'
    return
  }

  nameError.value = ''
}

    const sanitizePhone = () => {
      phone.value = phone.value.replace(/\D/g, '')
      if (phone.value.length < 8 || phone.value.length > 15)
        phoneError.value = 'Enter a valid phone number.'
      else phoneError.value = ''
    }

    const validatePassword = () => {
      const val = password.value
      const hasLetter = /[A-Za-z]/.test(val)
      const hasNumber = /\d/.test(val)
      const hasSymbol = /[^A-Za-z0-9]/.test(val)
      const len = val.length
      const ent = passwordEntropy(val)

      if (!hasLetter || !hasNumber || len < 6) {
        passwordStrength.value = 'weak'
        passwordMessage.value = '⚠️ Must include letters, numbers & be 6+ chars.'
      } else if (ent > 45 && hasSymbol && len >= 10) {
        passwordStrength.value = 'strong'
        passwordMessage.value = '✅ Excellent! Rock-solid password 🔐'
      } else if (ent > 30 && len >= 8) {
        passwordStrength.value = 'medium'
        passwordMessage.value = '👌 Good! Add symbols or length for more strength.'
      } else {
        passwordStrength.value = 'weak'
        passwordMessage.value = '⚠️ Password too simple.'
      }
    }

    // --- Advanced Email Validation ---
    const _checkEmail = async () => {
      const raw = email.value.trim().toLowerCase()
      emailValid.value = false
      emailMessage.value = ''
      checkingEmail.value = true

      if (!raw.includes('@')) {
        emailMessage.value = 'Please enter a valid email.'
        checkingEmail.value = false
        return
      }

      const [local, domain] = raw.split('@')
      if (!local || !domain) {
        emailMessage.value = 'Please enter a valid email.'
        checkingEmail.value = false
        return
      }

      // basic RFC shape
      const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRx.test(raw)) {
        emailMessage.value = 'Invalid email format.'
        checkingEmail.value = false
        return
      }

      // suspicious local-part patterns
      if (SUSPICIOUS_LOCAL.some(rx => rx.test(local))) {
        emailMessage.value = '🚫 Email looks like a test/demo account.'
        checkingEmail.value = false
        return
      }

      // disposable domains
      const d = domain.toLowerCase()
      if (DISPOSABLE_DOMAINS.has(d) || /tempmail| example.com | example.org|test.com| abc.com|mailinator.com| tempmail.com | tempmail.io | 10minutemail.com|yopmail.com | guerrillamail.com | trashmail.com| fakeinbox.com | dispostable.com | getnada.com |mailinator|10minutemail|guerrillamail|yopmail/i.test(d)) {
        emailMessage.value = '🚫 Disposable or fake mail providers are not allowed.'
        checkingEmail.value = false
        return
      }

      // common allowed TLD sanity
      if (!/^[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(domain)) {
    emailMessage.value = 'Invalid domain format.'
    checkingEmail.value = false
    return
  }

      // optionally: call backend to verify MX (skip if offline)
      try {
        const res = await fetch('/api/verify_email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: raw })
        })
        const data = await res.json()
        if (!data.ok) {
          emailMessage.value = data.message || 'Email domain not deliverable.'
          checkingEmail.value = false
          return
        }
      } catch {
        // ignore backend issues silently
      }

      checkingEmail.value = false
      emailValid.value = true
      emailMessage.value = '✅ Verified — looks safe to use!'
    }

    const validateEmail = debounce(_checkEmail, 400)

    const onSignup = async () => {
      sanitizeName()
      sanitizePhone()
      validatePassword()

      if (nameError.value || phoneError.value || !emailValid.value || passwordStrength.value === 'weak') {
        formInvalid.value = true
        toast.error('Please fix highlighted fields before continuing.')
        setTimeout(() => (formInvalid.value = false), 600)
        return
      }

      loading.value = true
      try {
        await signup(email.value, password.value, full_name.value, phone.value)
        showModal.value = true
      } catch (err) {
        toast.error(err.message)
      } finally {
        loading.value = false
      }
    }

    const closeModal = () => (showModal.value = false)
    const continueToProfile = () => {
      showModal.value = false
      router.push('/profile')
    }

    return {
      email, password, full_name, phone,
      nameError, phoneError,
      emailValid, emailMessage, checkingEmail,
      passwordStrength, passwordMessage,
      validatePassword, validateEmail,
      sanitizeName, sanitizePhone,
      loading, onSignup, showModal, closeModal, continueToProfile, formInvalid
    }
  }
}
</script>


<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&family=Dancing+Script:wght@600&display=swap');

/* === Page Base === */
.auth-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #fceaff, #d0f0fd);
  display: flex;
  padding: 2rem;
}

.auth-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 25px rgba(255, 111, 203, 0.2);
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  text-align: center;
  animation: floatCard 3s ease-in-out infinite;
  position: relative;
  overflow: visible;
}

/* shake when invalid submit */
.shake-invalid {
  animation: invalidShake 0.45s ease;
}

/* === Titles === */
.auth-title {
  font-family: 'Dancing Script', cursive;
  font-size: 2.2rem;
  background: linear-gradient(90deg, #ff6bcb, #845ef7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.3rem;
}

.auth-subtitle {
  font-family: 'Poppins', sans-serif;
  font-size: 1rem;
  color: #555;
  margin-bottom: 1.5rem;
}

/* === Email Validation === */
.email-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.email-status {
  position: absolute;
  right: 12px;
  font-size: 1.3rem;
  transition: all 0.4s ease;
  opacity: 0;
  transform: scale(0.8);
}

.email-status.checking {
  color: #ff6bcb;
  opacity: 1;
  transform: scale(1);
}

.email-status.valid {
  color: #28a745;
  opacity: 1;
  transform: scale(1.1);
  animation: tickPulse 0.6s ease;
}

.email-status.invalid {
  color: #dc3545;
  opacity: 1;
  transform: scale(1);
  animation: shake 0.4s ease;
}

@keyframes tickPulse {
  0% { transform: scale(0.7); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

/* === Email Message Animation === */
.email-message {
  font-family: 'Poppins', sans-serif;
  font-size: 0.9rem;
  margin-top: 6px;
  transition: all 0.4s ease;
  opacity: 0;
}

.email-message.show {
  opacity: 1;
}

.email-message.valid {
  color: #28a745;
  text-shadow: 0 0 8px rgba(40, 167, 69, 0.4);
  animation: glowGreen 1.2s ease-out;
}

.email-message.invalid {
  color: #dc3545;
  text-shadow: 0 0 8px rgba(220, 53, 69, 0.3);
  animation: fadeInRed 0.5s ease-out;
}

@keyframes glowGreen {
  0% { opacity: 0; text-shadow: 0 0 0 rgba(40, 167, 69, 0); }
  50% { opacity: 1; text-shadow: 0 0 12px rgba(40, 167, 69, 0.6); }
  100% { opacity: 1; text-shadow: 0 0 8px rgba(40, 167, 69, 0.4); }
}

@keyframes fadeInRed {
  0% { opacity: 0; }
  100% { opacity: 1; }
}

/* Trust Badge */
.trust-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #e9d8ff, #f8e3ff);
  border-radius: 50px;
  padding: 0.4rem 1rem;
  font-size: 0.9rem;
  color: #5a2ea6;
  font-weight: 600;
  box-shadow: 0 3px 8px rgba(132, 94, 247, 0.25);
  animation: badgePulse 3s infinite ease-in-out;
}

@keyframes badgePulse {
  0%, 100% { transform: scale(1); box-shadow: 0 3px 8px rgba(132, 94, 247, 0.25); }
  50% { transform: scale(1.03); box-shadow: 0 4px 12px rgba(132, 94, 247, 0.4); }
}

.shield-icon {
  margin-right: 6px;
  color: #845ef7;
}

/* Password strength bar */
.password-rules {
  margin-top: 6px;
}
.strength-bar {
  height: 5px;
  background: #eee;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 5px;
}
.strength-bar .bar {
  height: 100%;
  transition: width 0.4s ease, background-color 0.4s ease;
  border-radius: 20px;
}
.bar.weak { width: 33%; background: #ff4d6d; }
.bar.medium { width: 66%; background: #f7b731; }
.bar.strong { width: 100%; background: #28a745; }

.password-hint {
  font-size: 0.85rem;
}
.password-hint.weak { color: #ff4d6d; }
.password-hint.medium { color: #f7b731; }
.password-hint.strong { color: #28a745; }

/* === Dynamic Border Feedback === */
.form-control {
  border: 1.5px solid #ddd;
  transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.12s ease;
  border-radius: 50px;
  padding: 0.75rem 1rem;
}

.border-checking {
  border-color: #ff6bcb !important;
  box-shadow: 0 0 8px rgba(255, 107, 203, 0.4);
}

.border-valid {
  border-color: #28a745 !important;
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.4);
  animation: validPulse 1s ease;
}

.border-invalid {
  border-color: #dc3545 !important;
  box-shadow: 0 0 8px rgba(220, 53, 69, 0.3);
  animation: invalidShake 0.4s ease;
}

@keyframes validPulse {
  0% { box-shadow: 0 0 0 rgba(40, 167, 69, 0); }
  50% { box-shadow: 0 0 12px rgba(40, 167, 69, 0.6); }
  100% { box-shadow: 0 0 8px rgba(40, 167, 69, 0.4); }
}

@keyframes invalidShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-3px); }
  75% { transform: translateX(3px); }
}

/* small field error */
.field-error {
  display: block;
  margin-top: 6px;
  color: #dc3545;
  font-size: 0.85rem;
}

/* === Button & Link === */
.btn-primary {
  background: linear-gradient(45deg, #845ef7, #ff6bcb);
  border: none;
  border-radius: 50px;
  padding: 0.7rem 1.5rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(255, 107, 203, 0.4);
}

/* subtle sparkle on signup button */
.signup-btn {
  position: relative;
  overflow: visible;
}

.signup-btn::after {
  content: '✨';
  position: absolute;
  right: 16px;
  top: 6px;
  font-size: 0.9rem;
  opacity: 0;
  transform: translateY(-6px) scale(0.8);
  transition: all 0.35s ease;
}

.signup-btn:hover::after {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.link-gradient {
  background: linear-gradient(90deg, #ff6bcb, #845ef7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 600;
  text-decoration: none;
}

.link-gradient:hover {
  text-decoration: underline;
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-6px); }
}

/* === Modal === */
.modal-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(5, 5, 10, 0.35);
  z-index: 2000;
}

.modal-card {
  background: white;
  border-radius: 18px;
  padding: 2rem;
  width: 90%;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.18);
  position: relative;
  overflow: hidden;
  animation: popIn 0.45s cubic-bezier(.2,.9,.3,1);
}

@keyframes popIn {
  0% { transform: scale(0.85); opacity: 0; }
  60% { transform: scale(1.03); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.modal-title {
  font-family: 'Dancing Script', cursive;
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
  background: linear-gradient(90deg, #ff6bcb, #845ef7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.modal-sub {
  font-family: 'Poppins', sans-serif;
  color: #555;
  margin-bottom: 1rem;
}

/* emoji confetti runner */
.modal-emoji-runner {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.emoji {
  position: absolute;
  top: -10%;
  left: 50%;
  font-size: 1.1rem;
  opacity: 0.95;
  transform-origin: center;
  animation: drop 1200ms linear infinite;
}

/* place them at staggered positions */
.emoji:nth-child(1) { left: 10%; animation-delay: 0ms; }
.emoji:nth-child(2) { left: 20%; animation-delay: 80ms; transform: rotate(-20deg); }
.emoji:nth-child(3) { left: 30%; animation-delay: 160ms; transform: rotate(10deg); }
.emoji:nth-child(4) { left: 45%; animation-delay: 240ms; transform: rotate(-10deg); }
.emoji:nth-child(5) { left: 60%; animation-delay: 320ms; transform: rotate(20deg); }
.emoji:nth-child(6) { left: 70%; animation-delay: 400ms; transform: rotate(-15deg); }
.emoji:nth-child(7) { left: 80%; animation-delay: 480ms; transform: rotate(8deg); }
.emoji:nth-child(8) { left: 90%; animation-delay: 560ms; transform: rotate(-6deg); }
.emoji:nth-child(9) { left: 50%; animation-delay: 640ms; transform: rotate(12deg); }
.emoji:nth-child(10){ left: 15%; animation-delay: 720ms; transform: rotate(6deg); }
.emoji:nth-child(11){ left: 85%; animation-delay: 800ms; transform: rotate(-12deg); }
.emoji:nth-child(12){ left: 40%; animation-delay: 880ms; transform: rotate(18deg); }

@keyframes drop {
  0% { transform: translateY(-20%) scale(0.9); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translateY(140%) scale(1.05) rotate(45deg); opacity: 1; }
}

/* modal actions */
.modal-actions {
  display: flex;
  gap: 0.6rem;
  justify-content: center;
  margin-top: 1rem;
}

.btn-link {
  background: transparent;
  border: none;
  color: #845ef7;
  font-weight: 600;
  cursor: pointer;
}

/* accessibility */
@media (max-width: 480px) {
  .auth-card { padding: 1.25rem; }
  .modal-card { padding: 1.2rem; }
}
</style>
