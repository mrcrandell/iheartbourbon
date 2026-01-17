<script setup lang="ts">
import { useAuthStore } from "~/stores/auth";
const { loggedIn, user, session, fetch, clear, openInPopup } = useUserSession();

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isAuthModalOpen = ref(false);
const authTab = ref<"login" | "register">("login");

function openAuthModal(tab: "login" | "register") {
  authTab.value = tab;
  isAuthModalOpen.value = true;
}

function closeAuthModal() {
  isAuthModalOpen.value = false;
}

async function handleAuthSuccess() {
  closeAuthModal();
  if (route.query.redirect) {
    await navigateTo(route.query.redirect as string);
  }
}

function handleLogout() {
  authStore.logout();
  clear();
  router.push("/");
}

function checkAuth() {
  if (!authStore.isAuthenticated) {
    openAuthModal("login");
  } else {
    // handleLogout();
    console.log("User is authenticated");
  }
}

onMounted(() => {
  if (route.query.redirect && !authStore.isAuthenticated) {
    openAuthModal("login");
  }
});
</script>

<template>
  <nav class="navbar">
    <ul class="nav">
      <template v-if="authStore.isAuthenticated">
        <li class="nav-item">
          <NuxtLink class="nav-link" to="/">
            <IconHome />
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink class="nav-link" to="/group">
            <IconGroup />
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink class="nav-link" to="/bourbon/add">
            <IconPlus />
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink class="nav-link" to="/my-account">
            <IconUser />
          </NuxtLink>
        </li>
      </template>
      <li v-else class="nav-item">
        <button class="nav-link" @click="openAuthModal('login')">
          Login / Register
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
      <AuthLogin v-if="authTab === 'login'" @success="handleAuthSuccess" />
      <AuthRegister v-else @success="handleAuthSuccess" />
    </BaseModal>
  </nav>
</template>

<style lang="scss" scoped>
// Button reset for nav link style
.nav-link {
  background: none;
  border: none;
  width: 100%;
  cursor: pointer;
  font-family: inherit;
  font-size: inherit;
  color: $white;
  background-color: transparent;
  svg {
    display: block;
    width: rem(50);
    height: rem(50);
    margin: 0 auto;
    fill: currentColor;
  }
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
      > .nav-link,
      > .nav-link:focus {
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
