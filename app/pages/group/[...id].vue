<script setup lang="ts">
import QrcodeVue from "qrcode.vue";

definePageMeta({
  middleware: ["auth" as any],
});

const route = useRoute();
const router = useRouter();

const groupId = computed(() => {
  const id = route.params.id;
  return Array.isArray(id) ? id[0] : id;
});

const { data, pending, error, refresh } = await useFetch(
  `/api/groups/${groupId.value}`
);

const group = computed(() => data.value?.group);
const entries = computed(() => group.value?.groupEntries || []);
const members = computed(() => group.value?.groupUsers || []);
const averageRating = computed(() => group.value?.averageRating || 0);

// QR Code Modal
const showQRModal = ref(false);
const joinUrl = computed(() => {
  if (!group.value) return "";
  return `${window.location.origin}/join/${group.value.slug}`;
});

function openQRModal() {
  showQRModal.value = true;
}

function closeQRModal() {
  showQRModal.value = false;
}

function copyJoinLink() {
  if (!joinUrl.value) return;
  navigator.clipboard.writeText(joinUrl.value);
  alert("Link copied to clipboard!");
}
</script>

<template>
  <main class="main container py-4">
    <div v-if="pending" class="text-center">
      <span class="spinner-border spinner-border-sm me-2" />
      Loading group...
    </div>

    <div v-else-if="error" class="alert alert-danger">
      Failed to load group. Please try again.
    </div>

    <div v-else-if="group">
      <!-- Group Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h1 class="mb-2">{{ group.name }}</h1>
              <p class="text-muted mb-1">
                {{ group._count.groupUsers }} members •
                {{ group._count.groupEntries }} reviews
              </p>
              <div class="d-flex align-items-center gap-2">
                <span class="text-warning fs-5">
                  <span v-for="star in 5" :key="star">
                    {{ star <= Math.round(averageRating) ? "★" : "☆" }}
                  </span>
                </span>
                <span class="text-muted"
                  >{{ averageRating.toFixed(1) }} average</span
                >
              </div>
            </div>
            <button class="btn btn-primary" @click="openQRModal">
              Share Group
            </button>
          </div>
        </div>
      </div>

      <!-- Recent Reviews Feed -->
      <div class="row">
        <div class="col-12">
          <h2 class="h4 mb-3">Recent Reviews</h2>

          <div v-if="entries.length === 0" class="alert alert-info">
            No reviews yet. Be the first to add a bourbon review!
          </div>

          <div v-else class="list-group">
            <div
              v-for="groupEntry in entries"
              :key="groupEntry.id"
              class="list-group-item"
            >
              <div
                class="d-flex w-100 justify-content-between align-items-start"
              >
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <h5 class="mb-0">{{ groupEntry.entry.bourbon.name }}</h5>
                    <small class="text-muted">
                      by {{ groupEntry.entry.user.name }}
                    </small>
                  </div>
                  <div class="mb-2">
                    <span
                      v-for="star in 5"
                      :key="star"
                      class="text-warning"
                      :class="{ 'opacity-25': star > groupEntry.entry.rating }"
                    >
                      ★
                    </span>
                    <span v-if="groupEntry.entry.isThumbsUp" class="ms-2">
                      👍
                    </span>
                    <span v-else class="ms-2">👎</span>
                  </div>
                  <p v-if="groupEntry.entry.comment" class="mb-1">
                    {{ groupEntry.entry.comment }}
                  </p>
                  <small class="text-muted">
                    {{ new Date(groupEntry.createdAt).toLocaleDateString() }}
                  </small>
                </div>
                <div v-if="groupEntry.entry.bourbon.imageUrl" class="ms-3">
                  <img
                    :src="groupEntry.entry.bourbon.imageUrl"
                    :alt="groupEntry.entry.bourbon.name"
                    class="rounded"
                    style="width: 80px; height: 80px; object-fit: cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Members Section -->
      <div class="row mt-4">
        <div class="col-12">
          <h2 class="h5 mb-3">Members ({{ members.length }})</h2>
          <div class="d-flex flex-wrap gap-2">
            <span
              v-for="member in members"
              :key="member.id"
              class="badge bg-secondary"
            >
              {{ member.user.name }}
              <span v-if="member.role === 'ADMIN'" class="ms-1">👑</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <BaseModal :is-shown="showQRModal" @closed="closeQRModal">
      <template #header>
        <h5 class="modal-title">Share Group</h5>
      </template>
      <div class="text-center">
        <p class="mb-3">
          Scan this QR code or share the link to invite others to
          <strong>{{ group?.name }}</strong>
        </p>
        <div class="d-flex justify-content-center mb-3">
          <QrcodeVue :value="joinUrl" :size="300" level="H" />
        </div>
        <div class="input-group">
          <input type="text" class="form-control" :value="joinUrl" readonly />
          <button class="btn btn-outline-primary" @click="copyJoinLink">
            Copy
          </button>
        </div>
      </div>
    </BaseModal>
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
