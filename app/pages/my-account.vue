<script setup lang="ts">
definePageMeta({
  middleware: ["auth" as any],
});

const { user, fetch: refreshSession } = useUserSession();

const { data, pending, error } = await useFetch("/api/users/me/entries");

const entries = computed(() => data.value?.entries || []);

// Profile Form
const profileForm = ref({
  name: user.value?.name || "",
  email: user.value?.email || "",
});
const profileLoading = ref(false);
const profileErrors = ref<Record<string, string>>({});
const profileSuccess = ref(false);

// Password Form
const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});
const passwordLoading = ref(false);
const passwordErrors = ref<Record<string, string>>({});
const passwordSuccess = ref(false);

// Update Profile
async function updateProfile() {
  profileErrors.value = {};
  profileSuccess.value = false;
  profileLoading.value = true;

  try {
    await $fetch("/api/users/me/profile", {
      method: "PUT",
      body: {
        name: profileForm.value.name,
        email: profileForm.value.email,
      },
    });

    profileSuccess.value = true;
    await refreshSession();

    setTimeout(() => {
      profileSuccess.value = false;
    }, 3000);
  } catch (err: any) {
    profileErrors.value.general =
      err.data?.message || err.statusMessage || "Failed to update profile";
  } finally {
    profileLoading.value = false;
  }
}

// Change Password
async function changePassword() {
  passwordErrors.value = {};
  passwordSuccess.value = false;

  // Validate
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    passwordErrors.value.confirmPassword = "Passwords do not match";
    return;
  }

  if (passwordForm.value.newPassword.length < 8) {
    passwordErrors.value.newPassword = "Password must be at least 8 characters";
    return;
  }

  passwordLoading.value = true;

  try {
    await $fetch("/api/users/me/password", {
      method: "PUT",
      body: {
        currentPassword: passwordForm.value.currentPassword,
        newPassword: passwordForm.value.newPassword,
        confirmPassword: passwordForm.value.confirmPassword,
      },
    });

    passwordSuccess.value = true;
    passwordForm.value = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    setTimeout(() => {
      passwordSuccess.value = false;
    }, 3000);
  } catch (err: any) {
    passwordErrors.value.general =
      err.data?.message || err.statusMessage || "Failed to change password";
  } finally {
    passwordLoading.value = false;
  }
}
</script>

<template>
  <main class="main my-account container py-4">
    <div class="row">
      <div class="col-12">
        <h1 class="mb-4">My Account</h1>
        <p class="lead">Welcome, {{ user?.name || "User" }}!</p>
      </div>
    </div>

    <div class="row mt-4">
      <div class="col-12">
        <h2 class="h4 mb-3">My Bourbon Reviews</h2>

        <div v-if="pending" class="text-muted">
          <span class="spinner-border spinner-border-sm me-2" />
          Loading your reviews...
        </div>

        <div v-else-if="error" class="alert alert-danger">
          Failed to load reviews. Please try again.
        </div>

        <div v-else-if="entries.length === 0" class="alert alert-info">
          You haven't reviewed any bourbons yet.
          <NuxtLink to="/bourbon/add" class="alert-link"
            >Add your first review</NuxtLink
          >
        </div>

        <div v-else class="list-group">
          <div v-for="entry in entries" :key="entry.id" class="list-group-item">
            <div class="d-flex w-100 justify-content-between align-items-start">
              <div class="flex-grow-1">
                <h5 class="mb-1">
                  {{ entry.bourbon.name }}
                  <!-- <span v-if="entry.isThumbsUp" class="ms-2">👍</span>
                  <span v-else class="ms-2">👎</span> -->
                </h5>
                <div class="mb-2">
                  <span
                    v-for="star in 5"
                    :key="star"
                    class="text-warning"
                    :class="{ 'opacity-25': star > entry.rating }"
                  >
                    ★
                  </span>
                </div>
                <p v-if="entry.comment" class="mb-1">{{ entry.comment }}</p>
                <small class="text-muted">
                  {{ new Date(entry.createdAt).toLocaleDateString() }}
                </small>
              </div>
              <div v-if="entry.bourbon.imageUrl" class="ms-3">
                <img
                  :src="entry.bourbon.imageUrl"
                  :alt="entry.bourbon.name"
                  class="rounded"
                  style="width: 80px; height: 80px; object-fit: cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Edit Form -->
    <div class="row mt-4">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Profile Information</h5>
          </div>
          <div class="card-body">
            <div
              v-if="profileSuccess"
              class="alert alert-success alert-dismissible fade show"
            >
              Profile updated successfully!
            </div>
            <div v-if="profileErrors.general" class="alert alert-danger">
              {{ profileErrors.general }}
            </div>

            <form @submit.prevent="updateProfile">
              <div class="mb-3">
                <label for="name" class="form-label">Name</label>
                <input
                  id="name"
                  v-model="profileForm.name"
                  type="text"
                  class="form-control"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input
                  id="email"
                  v-model="profileForm.email"
                  type="email"
                  class="form-control"
                  required
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                :disabled="profileLoading"
              >
                <span
                  v-if="profileLoading"
                  class="spinner-border spinner-border-sm me-1"
                />
                Update Profile
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Password Change Form -->
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-header bg-white">
            <h5 class="mb-0">Change Password</h5>
          </div>
          <div class="card-body">
            <div
              v-if="passwordSuccess"
              class="alert alert-success alert-dismissible fade show"
            >
              Password changed successfully!
            </div>
            <div v-if="passwordErrors.general" class="alert alert-danger">
              {{ passwordErrors.general }}
            </div>

            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label for="currentPassword" class="form-label"
                  >Current Password</label
                >
                <input
                  id="currentPassword"
                  v-model="passwordForm.currentPassword"
                  type="password"
                  class="form-control"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="newPassword" class="form-label">New Password</label>
                <input
                  id="newPassword"
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': passwordErrors.newPassword }"
                  required
                />
                <div v-if="passwordErrors.newPassword" class="invalid-feedback">
                  {{ passwordErrors.newPassword }}
                </div>
              </div>

              <div class="mb-3">
                <label for="confirmPassword" class="form-label"
                  >Confirm New Password</label
                >
                <input
                  id="confirmPassword"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="form-control"
                  :class="{ 'is-invalid': passwordErrors.confirmPassword }"
                  required
                />
                <div
                  v-if="passwordErrors.confirmPassword"
                  class="invalid-feedback"
                >
                  {{ passwordErrors.confirmPassword }}
                </div>
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                :disabled="passwordLoading"
              >
                <span
                  v-if="passwordLoading"
                  class="spinner-border spinner-border-sm me-1"
                />
                Change Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.list-group-item {
  border-left: 4px solid transparent;
  transition: border-color 0.2s;
}

.list-group-item:hover {
  border-left-color: var(--bs-primary);
}
</style>
