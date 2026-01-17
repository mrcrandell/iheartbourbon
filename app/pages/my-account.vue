<script setup lang="ts">
definePageMeta({
  middleware: ["auth" as any],
});

const { user, fetch: refreshSession } = useUserSession();

const {
  data,
  pending,
  error,
  refresh: refreshEntries,
} = await useFetch("/api/users/me/entries");

const entries = computed(() => data.value?.entries || []);

// Edit Entry
const showEditModal = ref(false);
const editEntryId = ref<string | null>(null);
const editForm = ref({
  rating: 0,
  isThumbsUp: false,
  comment: "",
  groupIds: [] as string[],
});
const editLoading = ref(false);
const editErrors = ref<Record<string, string>>({});

function openEditModal(entry: any) {
  editEntryId.value = entry.id;
  editForm.value = {
    rating: entry.rating,
    isThumbsUp: entry.isThumbsUp,
    comment: entry.comment || "",
    groupIds: entry.groups?.map((g: any) => g.id) || [],
  };
  editErrors.value = {};
  showEditModal.value = true;
}

// Check for deep link to edit
const route = useRoute();
onMounted(() => {
  if (route.query.editEntry) {
    const entryId = route.query.editEntry as string;
    const entryToEdit = entries.value.find((e) => e.id === entryId);
    if (entryToEdit) {
      openEditModal(entryToEdit);
      // Clean up URL
      const newQuery = { ...route.query };
      delete newQuery.editEntry;
      navigateTo({ path: route.path, query: newQuery }, { replace: true });
    }
  }
});

async function updateEntry() {
  if (!editEntryId.value) return;

  editLoading.value = true;
  editErrors.value = {};

  try {
    await $fetch(`/api/entries/${editEntryId.value}`, {
      method: "PUT",
      body: editForm.value,
    });

    await refreshEntries();
    showEditModal.value = false;
  } catch (err: any) {
    console.error(err);
    // Handle Joi validation errors if mapped by backend
    if (err.statusCode === 400 && err.data?.data) {
      // Assuming Joi error format if customized, otherwise standard msg
    }
    editErrors.value = {
      general:
        err.data?.message || err.statusMessage || "Failed to update entry",
    };
  } finally {
    editLoading.value = false;
  }
}

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
  <main class="main content">
    <div class="page-container">
      <h1 class="page-title">My Account</h1>
      <p class="lead">Welcome, {{ user?.name || "User" }}!</p>

      <div class="section-container">
        <h2 class="section-title">My Bourbon Reviews</h2>

        <div v-if="pending" class="loading-state">
          <span class="spinner" />
          Loading your reviews...
        </div>

        <div v-else-if="error" class="alert alert-error">
          Failed to load reviews. Please try again.
        </div>

        <div v-else-if="entries.length === 0" class="alert alert-info">
          You haven't reviewed any bourbons yet.
          <NuxtLink to="/bourbon/add" class="alert-link">
            Add your first review
          </NuxtLink>
        </div>

        <div v-else class="item-list">
          <div
            v-for="entry in entries"
            :key="entry.id"
            class="item-card review-card clickable"
            role="button"
            tabindex="0"
            @click="openEditModal(entry)"
            @keydown.enter="openEditModal(entry)"
          >
            <div class="review-content">
              <h5 class="review-title">
                {{ entry.bourbon.name }}
              </h5>
              <div class="review-rating">
                <span class="star-rating">
                  <span
                    v-for="star in 5"
                    :key="star"
                    :class="{ 'star-empty': star > entry.rating }"
                  >
                    ★
                  </span>
                </span>
              </div>
              <p v-if="entry.comment" class="review-comment">
                {{ entry.comment }}
              </p>
              <small class="review-date">
                {{ new Date(entry.createdAt).toLocaleDateString() }}
              </small>
            </div>
            <div v-if="entry.bourbon.imageUrl" class="review-image">
              <img :src="entry.bourbon.imageUrl" :alt="entry.bourbon.name" />
            </div>
          </div>
        </div>
      </div>

      <div class="forms-container">
        <!-- Profile Edit Form -->
        <div class="form-card">
          <h3 class="section-title">Profile Information</h3>

          <div v-if="profileSuccess" class="alert alert-success">
            Profile updated successfully!
          </div>
          <div v-if="profileErrors.general" class="alert alert-error">
            {{ profileErrors.general }}
          </div>

          <form @submit.prevent="updateProfile">
            <div class="form-group">
              <label for="name" class="form-label">Name</label>
              <input
                id="name"
                v-model="profileForm.name"
                type="text"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Email</label>
              <input
                id="email"
                v-model="profileForm.email"
                type="email"
                class="form-input"
                required
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="profileLoading"
            >
              <span v-if="profileLoading" class="spinner spinner-sm" />
              Update Profile
            </button>
          </form>
        </div>

        <!-- Password Change Form -->
        <div class="form-card">
          <h3 class="section-title">Change Password</h3>

          <div v-if="passwordSuccess" class="alert alert-success">
            Password changed successfully!
          </div>
          <div v-if="passwordErrors.general" class="alert alert-error">
            {{ passwordErrors.general }}
          </div>

          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label for="currentPassword" class="form-label">
                Current Password
              </label>
              <input
                id="currentPassword"
                v-model="passwordForm.currentPassword"
                type="password"
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label for="newPassword" class="form-label">New Password</label>
              <input
                id="newPassword"
                v-model="passwordForm.newPassword"
                type="password"
                class="form-input"
                :class="{ 'is-invalid': passwordErrors.newPassword }"
                required
              />
              <div v-if="passwordErrors.newPassword" class="error-feedback">
                {{ passwordErrors.newPassword }}
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPassword" class="form-label">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                v-model="passwordForm.confirmPassword"
                type="password"
                class="form-input"
                :class="{ 'is-invalid': passwordErrors.confirmPassword }"
                required
              />
              <div v-if="passwordErrors.confirmPassword" class="error-feedback">
                {{ passwordErrors.confirmPassword }}
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary"
              :disabled="passwordLoading"
            >
              <span v-if="passwordLoading" class="spinner spinner-sm" />
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>

    <BaseModal
      class="edit-review-modal"
      :is-shown="showEditModal"
      @closed="showEditModal = false"
    >
      <template #header>
        <h3 class="modal-title">Edit Review</h3>
      </template>
      <template #default>
        <div v-if="editErrors.general" class="alert alert-error">
          {{ editErrors.general }}
        </div>

        <EntryForm
          v-model="editForm"
          :errors="editErrors"
          :is-loading-groups="false"
        />
      </template>
      <template #footer>
        <div class="modal-actions">
          <button class="btn btn-outline" @click="showEditModal = false">
            Cancel
          </button>
          <button
            class="btn btn-primary"
            :disabled="editLoading"
            @click="updateEntry"
          >
            <span v-if="editLoading" class="spinner spinner-sm" />
            Save Changes
          </button>
        </div>
      </template>
    </BaseModal>
  </main>
</template>

<style lang="scss" scoped>
.lead {
  font-size: 1.25rem;
  color: var(--text-secondary, #666);
  margin-bottom: 2rem;
}

.section-container {
  margin-bottom: 3rem;
}

.forms-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 768px) {
  .forms-container {
    grid-template-columns: 1fr 1fr;
  }
}

.review-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.clickable:focus-visible {
  outline: 2px solid var(--primary-color, #d35400);
  outline-offset: 2px;
}

.review-content {
  flex: 1;
}

.review-title {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0 0 0.5rem 0;
  color: var(--text-primary, #1a1a1a);
}

.review-rating {
  margin-bottom: 0.5rem;
}

.review-comment {
  margin: 0.5rem 0;
  color: var(--text-primary, #1a1a1a);
}

.review-date {
  color: var(--text-secondary, #666);
  font-size: 0.875rem;
}

.review-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.alert-link {
  color: inherit;
  font-weight: 600;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  width: 100%;
}

.edit-review-modal {
  :deep(.modal-body),
  :deep(.modal-footer) {
    padding: rem(32);
  }
}
</style>
