<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";

const route = useRoute();
const errorMessage = computed(() => route.query.error);

const { user } = useUserSession();
const authStore = useAuthStore();

watch(
  user,
  (newUser) => {
    if (newUser) {
      authStore.setUser(newUser as any);
    } else {
      authStore.logout();
    }
  },
  { immediate: true },
);
</script>

<template>
  <div>
    <NuxtLayout>
      <div
        v-if="errorMessage"
        style="padding: 1rem; max-width: 800px; margin: 0 auto"
      >
        <div class="alert alert-danger">
          Authentication Error: {{ errorMessage }}
        </div>
      </div>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
@use "@/assets/scss/base.scss" as *;
</style>
