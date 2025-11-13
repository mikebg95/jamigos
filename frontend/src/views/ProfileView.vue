<script setup>
import { useUserStore } from "../store/user.js";
const userStore = useUserStore();
</script>

<template>
  <div class="page">
    <div class="container">
      <h1 class="title">User Info</h1>
      <p><strong>Username:</strong> {{ userStore.user.username }}</p>
      <p><strong>First name:</strong> {{ userStore.user.firstName }}</p>
      <p><strong>Last name:</strong> {{ userStore.user.lastName }}</p>
      <p><strong>Email:</strong> {{ userStore.user.email }}</p>
      <p><strong>Roles:</strong> {{ userStore.user.roles.join(", ") }}</p>
    </div>
  </div>
</template>

<style scoped>
h2 {
  margin-bottom: 0.5rem;
}
p {
  margin: 0.25rem 0;
}
</style>
