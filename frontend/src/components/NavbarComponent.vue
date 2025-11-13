<script setup>
import AuthButtons from "@/components/AuthButtonsComponent.vue";
import { useUserStore } from "@/store/user.js";

const store = useUserStore();
</script>

<template>
  <!-- Top Navbar -->
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <router-link to="/" class="navbar-logo">
        <div class="logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="24" height="24" rx="6" fill="url(#gradient)" />
            <path d="M10 16L14 20L22 12" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            <defs>
              <linearGradient id="gradient" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                <stop stop-color="#667eea"/>
                <stop offset="1" stop-color="#764ba2"/>
              </linearGradient>
            </defs>
          </svg>
        </div>
        <span class="logo-text">TaskFlow</span>
      </router-link>

      <!-- Desktop Navigation Links -->
      <div class="navbar-links" v-if="store.isAuthenticated">
        <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
        <router-link to="/info" class="nav-link">Info</router-link>
        <router-link to="/todo" class="nav-link">To-do</router-link>
      </div>

      <!-- Auth Buttons -->
      <AuthButtons class="navbar-auth" />
    </div>
  </nav>

  <!-- Mobile Bottom Navigation -->
  <nav class="bottom-nav" v-if="store.isAuthenticated">
    <router-link to="/dashboard" class="bottom-nav-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="7" height="7"></rect>
        <rect x="14" y="3" width="7" height="7"></rect>
        <rect x="14" y="14" width="7" height="7"></rect>
        <rect x="3" y="14" width="7" height="7"></rect>
      </svg>
      <span class="bottom-nav-label">Dashboard</span>
    </router-link>

    <router-link to="/todo" class="bottom-nav-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M9 11l3 3L22 4"></path>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </svg>
      <span class="bottom-nav-label">Tasks</span>
    </router-link>

    <router-link to="/info" class="bottom-nav-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      <span class="bottom-nav-label">Info</span>
    </router-link>

    <router-link to="/profile" class="bottom-nav-item">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="10" r="3"></circle>
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
      </svg>
      <span class="bottom-nav-label">Profile</span>
    </router-link>
  </nav>
</template>

<style scoped lang="scss">

</style>
