<script setup lang="ts">
import { ref } from "vue";

const isRegisterModalOpen = ref(false);

function openRegisterModal() {
  isRegisterModalOpen.value = true;
}

function closeRegisterModal() {
  isRegisterModalOpen.value = false;
}
</script>

<template>
  <nav class="navbar">
    <ul class="nav">
      <li class="nav-item">
        <NuxtLink class="nav-link" to="/">Home</NuxtLink>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#services">Services</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#contact-us">Contact Us</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#about-us">About Us</a>
      </li>
      <li class="nav-item">
        <button class="nav-link btn-link" @click="openRegisterModal">
          Register
        </button>
      </li>
    </ul>

    <BaseModal :is-shown="isRegisterModalOpen" @closed="closeRegisterModal">
      <template #header>
        <h3>Register</h3>
        <button class="btn-close" @click="closeRegisterModal">X</button>
      </template>
      <AuthRegister @success="closeRegisterModal" />
    </BaseModal>
  </nav>
</template>

<style lang="scss" scoped>
// Button reset for nav link style
button.nav-link {
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
}

.btn-close {
  position: absolute;
  right: 1rem;
  top: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

nav.navbar {
  position: relative;
  padding: 0 rem(16);
  background-color: $silver-sand;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  @include bp-md-tablet {
    font-size: 1.25rem; // 20px
  }
  .nav {
    display: flex;
    flex-wrap: wrap;
    padding-left: 0;
    margin-bottom: 0;
    list-style: none;
    width: 100%;
    justify-content: center;
    .nav-item {
      flex: 1;
      > a,
      > a:focus {
        display: block;
        padding: 1.25rem 1rem;
        color: #fff;
        text-align: center;
        transition: background-color 0.5s ease;
        text-decoration: none;
        &:hover {
          background-color: $deep_cerulean;
        }
      }
    }
  }
}
</style>
