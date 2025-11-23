<script setup>
import authFacade from '@/auth/authFacade.js'
import { useUiStore } from '@/store/ui.js'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
import { LogIn, UserPlus } from 'lucide-vue-next'
import { UI } from '@/config/constants'
import { onMounted, onBeforeUnmount } from 'vue'
import { Capacitor } from '@capacitor/core'

const router = useRouter()
const ui = useUiStore()
const userStore = useUserStore()

// Disable scrolling on mobile only
const isNative = Capacitor.isNativePlatform()

onMounted(() => {
  if (isNative) {
    document.body.classList.add('no-scroll-mobile-auth')
  }
})

onBeforeUnmount(() => {
  if (isNative) {
    document.body.classList.remove('no-scroll-mobile-auth')
  }
})

const login = async () => {
  ui.startLoading()

  try {
    // Mobile: MobileAuthProvider.login() returns Promise with tokens
    const result = await authFacade.login()

    if (result) {
      console.log('[MobileAuthEntry] Mobile login successful, updating state...')

      // Update user store with authenticated state
      const authUser = authFacade.getCurrentUser()
      if (authUser) {
        userStore.setUser(authUser.authenticated, authUser.roles, authUser.tokenParsed)
      }

      // Navigate to dashboard
      if (userStore.isAuthenticated) {
        console.log('[MobileAuthEntry] Navigating to dashboard...')
        await router.push('/dashboard')
      }
    }
  } catch (error) {
    console.error('[MobileAuthEntry] Login failed:', error)

    // Don't show alert for cancellation - user intentionally closed browser
    if (error.code !== 'AUTH_CANCELLED') {
      alert(`Login failed: ${error.message}`)
    }
    // If cancelled, user stays on this screen (no navigation)
  } finally {
    ui.stopLoading()
  }
}

const signup = async () => {
  ui.startLoading()

  try {
    // Mobile: MobileAuthProvider.register() returns Promise with tokens
    const result = await authFacade.register()

    if (result) {
      console.log('[MobileAuthEntry] Mobile signup successful, updating state...')

      // Update user store with authenticated state
      const authUser = authFacade.getCurrentUser()
      if (authUser) {
        userStore.setUser(authUser.authenticated, authUser.roles, authUser.tokenParsed)
      }

      // Navigate to dashboard
      if (userStore.isAuthenticated) {
        console.log('[MobileAuthEntry] Navigating to dashboard...')
        await router.push('/dashboard')
      }
    }
  } catch (error) {
    console.error('[MobileAuthEntry] Signup failed:', error)

    // Don't show alert for cancellation - user intentionally closed browser
    if (error.code !== 'AUTH_CANCELLED') {
      alert(`Signup failed: ${error.message}`)
    }
    // If cancelled, user stays on this screen (no navigation)
  } finally {
    ui.stopLoading()
  }
}
</script>

<template>
  <div class="mobile-auth-entry">
    <div class="auth-container">
      <div class="logo-section">
        <div class="logo-icon" role="img" aria-label="Jamigos"></div>
        <h1 class="app-title">Jamigos</h1>
        <p class="tagline">Where Musicians Connect & Create</p>
      </div>

      <div class="auth-actions">
        <button @click="login" class="auth-btn auth-btn-primary">
          <LogIn :size="UI.ICON_SIZE_MD" :stroke-width="UI.ICON_STROKE_WIDTH" />
          <span>Sign In</span>
        </button>

        <button @click="signup" class="auth-btn auth-btn-secondary">
          <UserPlus :size="UI.ICON_SIZE_MD" :stroke-width="UI.ICON_STROKE_WIDTH" />
          <span>Create Account</span>
        </button>
      </div>

      <p class="footer-text">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.mobile-auth-entry {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ds-color-background);
  padding: var(--ds-spacing-xl);
}

.auth-container {
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-3xl);
}

.logo-section {
  text-align: center;
}

.logo-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto var(--ds-spacing-md) auto;
  display: block;

  // Apply gradient using mask-image technique (same as Keycloak mobile theme)
  background: linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary));

  // Use the SVG as a mask to shape the gradient
  mask-image: url(/jamigos-logo.svg);
  mask-size: contain;
  mask-repeat: no-repeat;
  mask-position: center;
  -webkit-mask-image: url(/jamigos-logo.svg);
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
}

.app-title {
  font-size: var(--ds-font-size-4xl);
  font-weight: var(--ds-font-weight-bold);
  background: linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--ds-spacing-md);
}

.tagline {
  font-size: var(--ds-font-size-base);
  color: var(--ds-color-text-secondary);
}

.auth-actions {
  display: flex;
  flex-direction: column;
  gap: var(--ds-spacing-md);
}

.auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--ds-spacing-sm);
  padding: var(--ds-spacing-lg) var(--ds-spacing-xl);
  border: none;
  border-radius: var(--ds-radius-lg);
  font-size: var(--ds-font-size-lg);
  font-weight: var(--ds-font-weight-semibold);
  cursor: pointer;
  transition: all var(--ds-duration-normal) var(--ds-ease-standard);

  &:active {
    transform: scale(0.98);
  }
}

.auth-btn-primary {
  background: var(--ds-color-primary);
  color: var(--ds-color-inverse-text);

  &:hover {
    //background: var(--ds-color-primary-dark);
  }
}

.auth-btn-secondary {
  background: var(--ds-color-secondary);
  color: var(--ds-color-inverse-text);

  &:hover {
    //background: var(--ds-color-secondary-dark);
  }
}

.footer-text {
  text-align: center;
  font-size: var(--ds-font-size-sm);
  color: var(--ds-color-text-tertiary);
  line-height: 1.5;
}
</style>
