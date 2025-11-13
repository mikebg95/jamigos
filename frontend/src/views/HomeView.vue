<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import keycloak from '@/auth/keycloak.js'
import { useUiStore } from '@/store/ui.js'
import { UI } from '@/config/constants'
import { FEATURES } from '@/config/features.js'

const router = useRouter()
const ui = useUiStore()

const isAuthenticated = computed(() => keycloak.authenticated)

const login = () => {
  ui.startLoading()
  keycloak.login()
}

const signup = () => {
  ui.startLoading()
  keycloak.register()
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
          Now Available
        </div>

        <h1 class="hero-title">
          Organize Your Life,
          <span class="gradient-text">One Task at a Time</span>
        </h1>

        <p class="hero-description">
          The modern todo application that helps you stay focused, organized, and productive.
          Built with cutting-edge technology for the ultimate task management experience.
        </p>

        <div class="hero-actions">
          <button v-if="!isAuthenticated" @click="signup" class="btn btn-primary">
            Get Started Free
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
            <div class="stat-value">10K+</div>
            <div class="stat-label">Active Users</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="stat-value">1M+</div>
            <div class="stat-label">Tasks Completed</div>
          </div>
          <div class="stat-divider"></div>
          <div class="stat">
            <div class="stat-value">99.9%</div>
            <div class="stat-label">Uptime</div>
          </div>
        </div>
      </div>

      <div class="hero-visual">
        <div class="floating-card card-1">
          <div class="card-header">
            <div class="card-dot"></div>
            <div class="card-dot"></div>
            <div class="card-dot"></div>
          </div>
          <div class="card-content">
            <div class="task-item completed">
              <div class="checkbox checked"></div>
              <span>Design landing page</span>
            </div>
            <div class="task-item completed">
              <div class="checkbox checked"></div>
              <span>Implement authentication</span>
            </div>
            <div class="task-item">
              <div class="checkbox"></div>
              <span>Deploy to production</span>
            </div>
          </div>
        </div>

        <div class="floating-card card-2">
          <div class="mini-stat">
            <div class="mini-stat-icon">
              <TrendingUp :size="UI.ICON_SIZE_LG" :stroke-width="UI.ICON_STROKE_WIDTH" />
            </div>
            <div>
              <div class="mini-stat-value">+24%</div>
              <div class="mini-stat-label">Productivity</div>
            </div>
          </div>
        </div>

        <div class="floating-card card-3">
          <div class="mini-stat">
            <div class="mini-stat-icon">
              <Target :size="UI.ICON_SIZE_LG" :stroke-width="UI.ICON_STROKE_WIDTH" />
            </div>
            <div>
              <div class="mini-stat-value">18/25</div>
              <div class="mini-stat-label">Tasks Done</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="section-header">
        <h2 class="section-title">Everything You Need to Stay Productive</h2>
        <p class="section-description">
          Powerful features designed to help you manage tasks efficiently and achieve your goals.
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
        <h2 class="cta-title">Ready to Get Started?</h2>
        <p class="cta-description">
          Join thousands of users who are already managing their tasks more effectively.
        </p>
        <div class="cta-actions">
          <button v-if="!isAuthenticated" @click="signup" class="btn btn-primary btn-large">
            Create Free Account
            <span class="btn-arrow">→</span>
          </button>
          <button v-if="isAuthenticated" @click="goToDashboard" class="btn btn-primary btn-large">
            Open Dashboard
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
  @include gradient-background;
  color: $text-primary;
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
  background: $surface-glass-medium;
  border: 1px solid $border-light;
  border-radius: $radius-full;
  font-size: $font-sm;
  font-weight: $font-medium;
  margin-bottom: $spacing-xl;
  animation: fadeInUp 0.6s ease-out;
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: $color-success;
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
  @include gradient-text;
}

.stat-label {
  font-size: $font-sm;
  color: $text-muted;
  margin-top: $spacing-xs;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: $border-light;
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

.card-header {
  display: flex;
  gap: $spacing-sm;
  margin-bottom: $spacing-md;
}

.card-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: $surface-overlay-medium;
}

.task-item {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm 0;
  color: $text-primary;
  font-size: $font-base;

  &.completed {
    color: $text-faint;
    text-decoration: line-through;
  }
}

.checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: $radius-sm;
  flex-shrink: 0;

  &.checked {
    @include gradient-primary;
    border-color: $color-primary-start;
    position: relative;

    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 12px;
    }
  }
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
  color: $color-primary-start;
}

.mini-stat-value {
  font-size: $font-2xl;
  font-weight: $font-bold;
  color: white;
}

.mini-stat-label {
  font-size: $font-sm;
  color: $text-muted;
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
  color: $color-primary-start;
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