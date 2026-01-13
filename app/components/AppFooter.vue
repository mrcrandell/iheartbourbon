<template>
  <footer class="footer">
    <p>
      602 West Prairie Street, Vicksburg, MI 49097 &middot;
      <a href="tel:12696491495">269-649-1495</a>
    </p>
    <p>
      Copyright &copy; {{ new Date().getFullYear() }} Vicksburg Family
      Dentistry. All Rights Reserved.
    </p>
    <p>
      Designated trademarks and brands are the property of their respective
      owners.
    </p>
    <p>
      Website created by
      <a href="https://www.mattcrandell.com" target="_blank">Matt Crandell</a>.
    </p>
  </footer>
</template>

<style lang="scss" scoped>
footer.footer {
  background-color: $emporor;
  font-size: $font-size-sm;
  padding: 30px;
  color: #ffffff;
  text-align: center;
  p {
    margin-bottom: 0.125rem; // 2px
  }
}
</style>
