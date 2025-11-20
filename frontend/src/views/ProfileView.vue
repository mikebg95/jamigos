<script setup>
import { useUserStore } from "../store/user.js";
import { useUiStore } from "../store/ui.js";
import authFacade from "@/auth/authFacade.js";
import { LogOut } from "lucide-vue-next";
import { UI } from '@/config/constants';
import { getTheme } from '@/utils/theme.js';

const userStore = useUserStore();
const uiStore = useUiStore();

const logout = () => {
  uiStore.startLoading();
  const theme = getTheme();
  // Add theme to redirect URI as query parameter
  const redirectPath = `/?theme=${theme}`;
  authFacade.logout(redirectPath);
};
</script>

<template>
  <div class="page">
    <div class="container">
      <h1 class="title">User Info</h1>
      <div class="profile-info">
        <p><strong>Username:</strong> {{ userStore.user.username }}</p>
        <p><strong>First name:</strong> {{ userStore.user.firstName }}</p>
        <p><strong>Last name:</strong> {{ userStore.user.lastName }}</p>
        <p><strong>Email:</strong> {{ userStore.user.email }}</p>
        <p><strong>Roles:</strong> {{ userStore.user.roles.join(", ") }}</p>
      </div>

      <div class="profile-actions">
        <button
          @click="logout"
          class="ds-btn ds-btn-error"
          aria-label="Log out of your account"
        >
          <LogOut :size="UI.ICON_SIZE_SM" :stroke-width="UI.ICON_STROKE_WIDTH" aria-hidden="true" />
          Log out
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.profile-info {
  margin-bottom: var(--ds-spacing-2xl);

  p {
    margin: var(--ds-spacing-base) 0;
    font-size: var(--ds-font-size-base);
    color: var(--ds-color-text-primary);

    strong {
      color: var(--ds-color-text-secondary);
      font-weight: var(--ds-font-weight-semibold);
      min-width: 120px;
      display: inline-block;
    }
  }
}

.profile-actions {
  display: flex;
  gap: var(--ds-spacing-md);
  margin-top: var(--ds-spacing-2xl);
  padding-top: var(--ds-spacing-2xl);
  border-top: 1px solid var(--ds-color-divider);
}
</style>
