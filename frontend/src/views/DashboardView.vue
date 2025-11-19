<script setup>
import {computed} from "vue";
import { useUserStore } from "@/store/user";
import DashboardAdminView from "@/views/DashboardAdminView.vue";
import DashboardUserView from "@/views/DashboardUserView.vue";

const user = useUserStore();

const isAdmin = computed(() => user.hasRole("ADMIN"));
</script>

<template>
<div class="page">
  <div class="container">
    <DashboardAdminView v-if="isAdmin" />
    <DashboardUserView v-else />
  </div>
</div>
</template>

