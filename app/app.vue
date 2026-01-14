<script setup lang="ts">
const route = useRoute();
const errorMessage = computed(() => route.query.error);
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
