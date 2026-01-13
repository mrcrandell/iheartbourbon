<template>
  <div class="default-layout">
    <AppHeader />
    <AppNavbar />
    <slot></slot>
    <AppFooter />
  </div>
</template>

<style lang="scss" scoped>
.default-layout {
  min-height: 100dvh;
  margin-right: auto;
  margin-left: auto;
  background: $white;
  width: 100%;
  max-width: rem(1360);
  @include shadow-5();
}
</style>
