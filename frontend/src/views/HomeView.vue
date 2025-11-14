<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import keycloak from '@/auth/keycloak.js'
import { useUiStore } from '@/store/ui.js'
import { UI } from '@/config/constants'
import { FEATURES } from '@/config/features.js'
import { getTheme } from '@/utils/theme.js'

const router = useRouter()
const ui = useUiStore()

const isAuthenticated = computed(() => keycloak.authenticated)

const login = () => {
  ui.startLoading()
  const theme = getTheme()
  // Store theme in sessionStorage so it persists across redirect
  sessionStorage.setItem('pending-auth-theme', theme)
  // Add theme to redirect URI as query parameter
  const redirectUri = `${window.location.origin}${window.location.pathname}?theme=${theme}`
  keycloak.login({ redirectUri })
}

const signup = () => {
  ui.startLoading()
  const theme = getTheme()
  // Store theme in sessionStorage so it persists across redirect
  sessionStorage.setItem('pending-auth-theme', theme)
  // Add theme to redirect URI as query parameter
  const redirectUri = `${window.location.origin}${window.location.pathname}?theme=${theme}`
  keycloak.register({ redirectUri })
}

const goToDashboard = () => {
  router.push('/dashboard')
}

// Use imported features constant
const features = FEATURES
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">
          <span class="badge-dot"></span>
          Now in Beta
        </div>

        <h1 class="hero-title">
          Where Musicians
          <span class="gradient-text">Connect & Create</span>
        </h1>

        <p class="hero-description">
          Join jam sessions, showcase your talent, and discover your next bandmate—all powered by AI-driven matching.
        </p>

        <div class="hero-actions">
          <button v-if="!isAuthenticated" @click="signup" class="btn btn-primary">
            Start Jamming Free
            <span class="btn-arrow">→</span>
          </button>
          <button v-if="!isAuthenticated" @click="login" class="btn btn-secondary">
            Sign In
          </button>
          <button v-if="isAuthenticated" @click="goToDashboard" class="btn btn-primary">
            Go to Dashboard
            <span class="btn-arrow">→</span>
          </button>
        </div>

        <div class="hero-stats">
          <div class="stat">
            <div class="stat-value">5K+</div>
            <div class="stat-label">Musicians</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="stat-value">10K+</div>
            <div class="stat-label">Jam Sessions</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="stat-value">500+</div>
            <div class="stat-label">Bands Formed</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="floating-card card-1">
          <div class="session-card">
            <div class="session-header">
              <span class="session-badge">Jazz Fusion</span>
              <span class="session-time">Today, 7:00 PM</span>
            </div>
            <div class="session-title">Upcoming Jam Session</div>
            <div class="session-musicians">
              <div class="musician-avatar">JD</div>
              <div class="musician-avatar">SM</div>
              <div class="musician-avatar">TK</div>
              <div class="musician-count">+2</div>
            </div>
            <div class="session-instruments">
              <span class="instrument-tag">Guitar</span>
              <span class="instrument-tag">Bass</span>
              <span class="instrument-tag">Drums</span>
            </div>
          </div>
        </div>

        <div class="floating-card card-2">
          <div class="mini-stat">
            <div class="mini-stat-icon music-note">♪</div>
            <div>
              <div class="mini-stat-value">+42</div>
              <div class="mini-stat-label">New Sessions</div>
            </div>
          </div>
        </div>

        <div class="floating-card card-3">
          <div class="recording-card">
            <div class="waveform">
              <div class="wave-bar" style="height: 40%"></div>
              <div class="wave-bar" style="height: 70%"></div>
              <div class="wave-bar" style="height: 50%"></div>
              <div class="wave-bar" style="height: 85%"></div>
              <div class="wave-bar" style="height: 60%"></div>
              <div class="wave-bar" style="height: 75%"></div>
              <div class="wave-bar" style="height: 45%"></div>
              <div class="wave-bar" style="height: 90%"></div>
            </div>
            <div class="recording-info">
              <span class="recording-title">Blues Jam</span>
              <span class="recording-date">Dec 12</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="section-header">
        <h2 class="section-title">Everything You Need to Jam</h2>
        <p class="section-description">
          From discovery to recording, Jamigos connects musicians at every step of the creative journey.
        </p>
      </div>

      <div class="features-grid">
        <div
          v-for="(feature, index) in features"
          :key="index"
          class="feature-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="feature-icon">
            <component :is="feature.icon" :size="UI.ICON_SIZE_XL" :stroke-width="UI.ICON_STROKE_WIDTH_THIN" />
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-card">
        <h2 class="cta-title">Ready to Find Your Next Jam?</h2>
        <p class="cta-description">
          Join thousands of musicians creating, connecting, and collaborating on Jamigos.
        </p>
        <div class="cta-actions">
          <button v-if="!isAuthenticated" @click="signup" class="btn btn-primary btn-large">
            Create Free Account
            <span class="btn-arrow">→</span>
          </button>
          <button v-if="isAuthenticated" @click="goToDashboard" class="btn btn-primary btn-large">
            Go to Dashboard
            <span class="btn-arrow">→</span>
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
@use '@/scss/variables' as *;
@use '@/scss/mixins' as *;

.home {
  min-height: 100vh;
  background: var(--ds-color-background);
  color: var(--ds-color-text-primary);
  overflow-x: hidden;
}

/* Hero Section */
.hero {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-4xl;
  align-items: center;
  @include container;
  padding-top: 8rem;
  padding-bottom: 6rem;
  min-height: 90vh;

  @include respond-to(md) {
    grid-template-columns: 1fr;
    padding-top: 6rem;
    padding-bottom: 4rem;
    gap: $spacing-3xl;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  background: var(--ds-color-surface-subtle);
  border: 1px solid var(--ds-color-border-subtle);
  border-radius: $radius-full;
  font-size: $font-sm;
  font-weight: $font-medium;
  margin-bottom: $spacing-xl;
  animation: fadeInUp 0.6s ease-out;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: var(--ds-color-success);
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

// Title, gradient-text, and description now use global typography classes

.hero-actions {
  display: flex;
  gap: $spacing-md;
  margin-bottom: $spacing-3xl;
  animation: fadeInUp 0.6s ease-out 0.3s both;

  @include respond-to(sm) {
    flex-direction: column;
  }
}

// Button styles are now global

.hero-stats {
  display: flex;
  gap: $spacing-xl;
  align-items: center;
  animation: fadeInUp 0.6s ease-out 0.4s both;

  @include respond-to(sm) {
    gap: $spacing-md;
  }
}

.stat {
  text-align: center;
}

.stat-value {
  font-size: $font-3xl;
  font-weight: $font-bold;
  background: linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: $font-sm;
  color: var(--ds-color-text-tertiary);
  margin-top: $spacing-xs;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--ds-color-divider);
}

/* Hero Visual */
.hero-visual {
  position: relative;
  height: 600px;

  @include respond-to(md) {
    height: 400px;
  }
}

// floating-card is now global (in _cards.scss)

.card-1 {
  top: 10%;
  left: 10%;
  width: 320px;
  animation-delay: 0s;

  @include respond-to(md) {
    width: 280px;
    left: 5%;
  }
}

.card-2 {
  top: 40%;
  right: 15%;
  animation-delay: 1s;

  @include respond-to(md) {
    right: 5%;
  }
}

.card-3 {
  bottom: 15%;
  left: 20%;
  animation-delay: 2s;

  @include respond-to(md) {
    left: 10%;
  }
}

// Session Card Styles
.session-card {
  width: 100%;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-md;
}

.session-badge {
  display: inline-block;
  padding: $spacing-xs $spacing-sm;
  background: linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary));
  border-radius: $radius-full;
  font-size: $font-xs;
  font-weight: $font-semibold;
  color: var(--ds-color-inverse-text);
}

.session-time {
  font-size: $font-xs;
  color: var(--ds-color-text-tertiary);
}

.session-title {
  font-size: $font-lg;
  font-weight: $font-semibold;
  color: var(--ds-color-text-primary);
  margin-bottom: $spacing-md;
}

.session-musicians {
  display: flex;
  align-items: center;
  gap: $spacing-xs;
  margin-bottom: $spacing-md;
}

.musician-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-xs;
  font-weight: $font-bold;
  color: var(--ds-color-inverse-text);
  border: 2px solid var(--ds-color-background);
}

.musician-count {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--ds-color-surface-subtle);
  border: 1px dashed var(--ds-color-border-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: $font-xs;
  color: var(--ds-color-text-secondary);
}

.session-instruments {
  display: flex;
  gap: $spacing-xs;
  flex-wrap: wrap;
}

.instrument-tag {
  padding: $spacing-xs $spacing-sm;
  background: var(--ds-color-surface-subtle);
  border: 1px solid var(--ds-color-border-subtle);
  border-radius: $radius-sm;
  font-size: $font-xs;
  color: var(--ds-color-text-secondary);
}

// Waveform Styles
.recording-card {
  width: 100%;
}

.waveform {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4px;
  height: 60px;
  margin-bottom: $spacing-md;
}

.wave-bar {
  flex: 1;
  background: linear-gradient(180deg, var(--ds-color-primary) 0%, var(--ds-color-secondary) 100%);
  border-radius: $radius-xs;
  animation: pulseScale 1.5s ease-in-out infinite;
  min-height: 20%;

  &:nth-child(2) {
    animation-delay: 0.1s;
  }
  &:nth-child(3) {
    animation-delay: 0.2s;
  }
  &:nth-child(4) {
    animation-delay: 0.3s;
  }
  &:nth-child(5) {
    animation-delay: 0.4s;
  }
  &:nth-child(6) {
    animation-delay: 0.5s;
  }
  &:nth-child(7) {
    animation-delay: 0.6s;
  }
  &:nth-child(8) {
    animation-delay: 0.7s;
  }
}

.recording-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recording-title {
  font-size: $font-base;
  font-weight: $font-medium;
  color: var(--ds-color-text-primary);
}

.recording-date {
  font-size: $font-sm;
  color: var(--ds-color-text-tertiary);
}

.mini-stat {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.mini-stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--ds-color-primary);

  &.music-note {
    font-size: $font-3xl;
    font-weight: $font-bold;
    background: linear-gradient(135deg, var(--ds-color-primary), var(--ds-color-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.mini-stat-value {
  font-size: $font-2xl;
  font-weight: $font-bold;
  color: var(--ds-color-text-primary);
}

.mini-stat-label {
  font-size: $font-sm;
  color: var(--ds-color-text-secondary);
}

/* Features Section */
.features {
  @include container;
  padding: $spacing-4xl 0;
}

.section-header {
  text-align: center;
  margin-bottom: $spacing-4xl;
}

// section-title and section-description are now global typography classes

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: $spacing-xl;
}

// feature-card, feature-title, feature-description are now global classes

.feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: $spacing-md;
  color: var(--ds-color-primary);
}

/* CTA Section */
.cta {
  @include container;
  padding: $spacing-4xl 0;
}

// cta-card, cta-title, cta-description are now global classes in typography/cards

.cta-actions {
  display: flex;
  justify-content: center;
  gap: $spacing-md;

  @include respond-to(sm) {
    flex-direction: column;
    align-items: center;
  }
}

// Animations are now global (in base/_animations.scss)
</style>