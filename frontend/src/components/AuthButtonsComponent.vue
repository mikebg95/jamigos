<script setup>
import keycloak from "../auth/keycloak";
import { useUiStore } from "@/store/ui.js";

const ui = useUiStore();

const login = () => {
  ui.startLoading();
  keycloak.login();
}
const logout = () => {
  ui.startLoading();
  keycloak.logout({ redirectUri: window.location.origin });
}
const signup = () => {
  ui.startLoading();
  keycloak.register();
}
</script>

<template>
  <div class="auth-buttons">
    <router-link to="/profile" v-if="keycloak.authenticated" class="profile-link">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <circle cx="12" cy="10" r="3"></circle>
        <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"></path>
      </svg>
      <span class="username">{{ keycloak.tokenParsed?.preferred_username }}</span>
    </router-link>
    <button v-if="!keycloak.authenticated" @click="login" class="btn-secondary">Log in</button>
    <button v-if="!keycloak.authenticated" @click="signup" class="btn-primary">Sign Up</button>
    <button v-else @click="logout" class="btn-primary">Log out</button>
  </div>
</template>

<style scoped lang="scss">
.auth-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.profile-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(102, 126, 234, 0.3);
    transform: translateY(-2px);
  }

  svg {
    flex-shrink: 0;
  }

  .username {
    @media (max-width: 480px) {
      display: none;
    }
  }
}

.btn-primary,
.btn-secondary {
  padding: 0.625rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  white-space: nowrap;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(102, 126, 234, 0.3);
  }
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    transform: translateY(-2px);
  }
}
</style>