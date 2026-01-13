<template>
  <div class="color-swatches">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.color-swatches {
  display: grid;
  grid-gap: 30px;
  @include bp-lg-laptop {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>