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
  <main class="main container py-4">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <h1 class="mb-4">Groups</h1>

        <!-- My Groups List -->
        <div v-if="loadingGroups" class="mb-4">
          <span class="spinner-border spinner-border-sm me-2" />
          Loading your groups...
        </div>

        <div v-else-if="groupsData && groupsData.length > 0" class="mb-4">
          <h2 class="h5 mb-3">My Groups</h2>
          <div class="list-group">
            <NuxtLink
              v-for="group in groupsData"
              :key="group.id"
              :to="`/group/${group.id}`"
              class="list-group-item list-group-item-action"
            >
              <div
                class="d-flex w-100 justify-content-between align-items-center"
              >
                <div>
                  <h6 class="mb-1">{{ group.name }}</h6>
                  <small class="text-muted">
                    {{ group.memberCount }} members
                    <span v-if="group.role === 'ADMIN'" class="ms-2"
                      >👑 Admin</span
                    >
                  </small>
                </div>
                <span class="text-muted">→</span>
              </div>
            </NuxtLink>
          </div>
        </div>

        <h2 class="h5 mb-3">Create New Group</h2>

        <div class="card shadow-sm">
          <div class="card-body">
            <div v-if="errors.general" class="alert alert-danger">
              {{ errors.general }}
            </div>

            <form @submit.prevent="createGroup">
              <div class="mb-3">
                <label for="groupName" class="form-label"
                  >Group Name <span class="text-danger">*</span></label
                >
                <input
                  id="groupName"
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="e.g. Bourbon Enthusiasts"
                  required
                />
                <div v-if="errors.name" class="invalid-feedback">
                  {{ errors.name }}
                </div>
                <small class="form-text text-muted">
                  Create a group to share bourbon reviews with friends.
                </small>
              </div>

              <div class="d-flex gap-2">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="isLoading"
                >
                  <span
                    v-if="isLoading"
                    class="spinner-border spinner-border-sm me-1"
                  />
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
      </div>
    </div>
  </main>
</template>
