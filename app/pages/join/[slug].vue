<script setup lang="ts">
definePageMeta({
  middleware: ["auth" as any],
});

const route = useRoute();
const router = useRouter();
const slug = route.params.slug as string;

const { data, pending, error } = await useFetch(`/api/groups/slug/${slug}`);
const group = computed(() => data.value?.group);

const joining = ref(false);
const joinError = ref("");

async function joinGroup() {
  joining.value = true;
  joinError.value = "";

  try {
    const response = await $fetch<{ group: { id: string } }>(
      "/api/groups/join",
      {
        method: "POST",
        body: { slug },
      }
    );

    // Redirect to the group page
    router.push(`/group/${response.group.id}`);
  } catch (err: any) {
    joinError.value =
      err.data?.message || err.statusMessage || "Failed to join group";
  } finally {
    joining.value = false;
  }
}
</script>

<template>
  <main class="main content">
    <div class="page-container">
      <div v-if="pending" class="loading-state">
        <span class="spinner" />
        Loading invitation...
      </div>

      <div v-else-if="error || !group" class="alert alert-error">
        {{ error?.statusMessage || "Group not found or invitation expired." }}
        <div class="mt-4">
          <NuxtLink to="/" class="btn btn-primary">Go Home</NuxtLink>
        </div>
      </div>

      <div v-else class="join-card form-card">
        <h1 class="page-title text-center">Join Group</h1>

        <div class="invite-details">
          <p class="invite-text">You have been invited to join:</p>
          <h2 class="group-name">{{ group.name }}</h2>
          <div class="group-meta">
            <span>Created by {{ group.creator.name }}</span>
            <span>•</span>
            <span>{{ group._count.groupUsers }} Members</span>
            <span>•</span>
            <span>{{ group._count.groupEntries }} Reviews</span>
          </div>
        </div>

        <div v-if="joinError" class="alert alert-error">
          {{ joinError }}
        </div>

        <div class="actions">
          <button
            class="btn btn-primary btn-lg w-100"
            :disabled="joining"
            @click="joinGroup"
          >
            <span v-if="joining" class="spinner spinner-sm" />
            Join Group
          </button>

          <NuxtLink to="/" class="btn btn-outline w-100"> Cancel </NuxtLink>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.page-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.join-card {
  max-width: 500px;
  width: 100%;
  text-align: center;
  padding: 3rem 2rem;
}

.invite-text {
  color: var(--text-secondary, #666);
  margin-bottom: 0.5rem;
}

.group-name {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--text-primary, #1a1a1a);
}

.group-meta {
  color: var(--text-secondary, #666);
  font-size: 0.9rem;
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.w-100 {
  width: 100%;
}

.btn-lg {
  padding: 1rem;
  font-size: 1.1rem;
}

.text-center {
  text-align: center;
}

.mt-4 {
  margin-top: 1rem;
}
</style>
