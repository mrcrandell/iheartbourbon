<script setup lang="ts">
import { ref } from "vue";

const isAuthModalOpen = ref(false);
const authTab = ref<"login" | "register">("login");

function openAuthModal(tab: "login" | "register") {
  authTab.value = tab;
  isAuthModalOpen.value = true;
}

function closeAuthModal() {
  isAuthModalOpen.value = false;
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
        <button class="nav-link btn-link" @click="openAuthModal('login')">
          Login
        </button>
      </li>
      <li class="nav-item">
        <button class="nav-link btn-link" @click="openAuthModal('register')">
          Register
        </button>
      </li>
    </ul>

    <BaseModal :is-shown="isAuthModalOpen" @closed="closeAuthModal">
      <template #header>
        <div class="auth-tabs">
          <button
            class="tab-btn"
            :class="{ active: authTab === 'login' }"
            @click="authTab = 'login'"
          >
            Login
          </button>
          <button
            class="tab-btn"
            :class="{ active: authTab === 'register' }"
            @click="authTab = 'register'"
          >
            Register
          </button>
        </div>
        <button class="btn-close" @click="closeAuthModal">X</button>
      </template>
      <AuthLogin v-if="authTab === 'login'" @success="closeAuthModal" />
      <AuthRegister v-else @success="closeAuthModal" />
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

.auth-tabs {
  display: flex;
  gap: 1.5rem;

  .tab-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    font-weight: bold;
    cursor: pointer;
    opacity: 0.5;
    padding: 0;
    padding-bottom: 0.25rem;
    border-bottom: 3px solid transparent;
    transition: all 0.2s ease;

    &:hover {
      opacity: 0.8;
    }

    &.active {
      opacity: 1;
      border-bottom-color: $deep_cerulean;
      color: $deep_cerulean;
    }
  }
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
