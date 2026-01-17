<script setup lang="ts">
definePageMeta({
  middleware: ["auth" as any],
});

const router = useRouter();

const formData = ref({
  name: "",
});

const isLoading = ref(false);
const errors = ref<Record<string, string>>({});

// Fetch user's groups
const { data: groupsData, pending: loadingGroups } = await useFetch(
  "/api/groups"
);

async function createGroup() {
  errors.value = {};

  if (!formData.value.name.trim()) {
    errors.value.name = "Group name is required";
    return;
  }

  isLoading.value = true;

  try {
    const { group } = await $fetch("/api/groups", {
      method: "POST",
      body: {
        name: formData.value.name,
      },
    });

    router.push(`/group/${group.id}`);
  } catch (err: any) {
    errors.value.general =
      err.data?.message || err.statusMessage || "Failed to create group";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <main class="main content">
    <div class="page-container">
      <h1 class="page-title">Groups</h1>

      <!-- My Groups List -->
      <div v-if="loadingGroups" class="loading-state">
        <span class="spinner" />
        Loading your groups...
      </div>

      <div
        v-else-if="groupsData && groupsData.length > 0"
        class="groups-section"
      >
        <h2 class="section-title">My Groups</h2>
        <div class="groups-list">
          <NuxtLink
            v-for="group in groupsData"
            :key="group.id"
            :to="`/group/${group.id}`"
            class="group-item"
          >
            <div class="group-info">
              <h6 class="group-name">{{ group.name }}</h6>
              <small class="group-meta">
                {{ group.memberCount }} members
              </small>
            </div>
            <span class="group-arrow">→</span>
          </NuxtLink>
        </div>
      </div>

      <hr class="divider" />

      <h2 class="section-title">Create New Group</h2>

      <div class="form-card">
        <div v-if="errors.general" class="alert alert-error">
          {{ errors.general }}
        </div>

        <form @submit.prevent="createGroup">
          <div class="form-group">
            <label for="groupName" class="form-label"
              >Group Name <span class="required">*</span></label
            >
            <input
              id="groupName"
              v-model="formData.name"
              type="text"
              class="form-input"
              :class="{ 'is-invalid': errors.name }"
              placeholder="e.g. Bourbon Enthusiasts"
              required
            />
            <div v-if="errors.name" class="error-feedback">
              {{ errors.name }}
            </div>
            <small class="form-help">
              Create a group to share bourbon reviews with friends.
            </small>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span v-if="isLoading" class="spinner spinner-sm" />
              Create Group
            </button>
            <button
              type="button"
              class="btn btn-secondary"
              @click="router.back()"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
/* Groups List */
.groups-section {
  margin-bottom: 2rem;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
}

.group-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  text-decoration: none;
  color: inherit;
  transition: background-color 0.2s;
}

.group-item:last-child {
  border-bottom: none;
}

.group-item:hover {
  background-color: #f8f9fa;
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 1rem;
  font-weight: 500;
  margin: 0 0 0.25rem 0;
  color: var(--text-primary, #1a1a1a);
}

.group-meta {
  color: var(--text-secondary, #666);
  font-size: 0.875rem;
}

.group-arrow {
  color: var(--text-secondary, #666);
  font-size: 1.25rem;
}
</style>
