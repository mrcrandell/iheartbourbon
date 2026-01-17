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

// Entry Modal
const showEntryModal = ref(false);
const selectedBourbon = ref<{ id: string; name: string } | null>(null);
const bourbonEntries = ref<any[]>([]);
const loadingEntries = ref(false);
const isSubmittingEntry = ref(false);
const entryErrors = ref({});

const newEntryData = ref({
  rating: 5,
  isThumbsUp: true,
  comment: "",
  groupIds: [] as string[],
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

async function openEntryModal(bourbon: { id: string; name: string }) {
  selectedBourbon.value = bourbon;
  showEntryModal.value = true;
  loadingEntries.value = true;

  // Reset form
  newEntryData.value = {
    rating: 5,
    isThumbsUp: true,
    comment: "",
    groupIds: [],
  };
  entryErrors.value = {};

  try {
    const entries = await $fetch(`/api/bourbons/${bourbon.id}/entries`);
    bourbonEntries.value = entries || [];
  } catch (e) {
    console.error("Failed to load entries", e);
    bourbonEntries.value = [];
  } finally {
    loadingEntries.value = false;
  }
}

function closeEntryModal() {
  showEntryModal.value = false;
  selectedBourbon.value = null;
}

async function submitEntry() {
  if (!selectedBourbon.value) return;

  isSubmittingEntry.value = true;
  entryErrors.value = {};

  try {
    await $fetch("/api/entries", {
      method: "POST",
      body: {
        bourbonId: selectedBourbon.value.id,
        ...newEntryData.value,
      },
    });

    closeEntryModal();
    // Refresh the group feed to show new entry if applicable
    refresh();
  } catch (err: any) {
    if (err.data?.data) {
      // Map Joi errors if returned in that format, or just message
      // Assuming simple message for now as per previous implementation structure
    }
    alert(err.data?.message || "Failed to submit entry");
  } finally {
    isSubmittingEntry.value = false;
  }
}
</script>

<template>
  <main class="main content">
    <div v-if="pending" class="loading-state">
      <span class="spinner" />
      Loading group...
    </div>

    <div v-else-if="error" class="alert alert-error">
      Failed to load group. Please try again.
    </div>

    <div v-else-if="group" class="page-container">
      <!-- Group Header -->
      <div class="group-header">
        <div class="header-content">
          <h1 class="page-title">{{ group.name }}</h1>
          <p class="group-stats">
            {{ group._count.groupUsers }} members •
            {{ group._count.groupEntries }} reviews
          </p>
          <div class="rating-display">
            <span class="star-rating">
              <span
                v-for="star in 5"
                :key="star"
                :class="{ 'star-empty': star > Math.round(averageRating) }"
              >
                ★
              </span>
            </span>
            <span class="rating-text"
              >{{ averageRating.toFixed(1) }} average</span
            >
          </div>
        </div>
        <button class="btn btn-primary" @click="openQRModal">
          Share Group
        </button>
      </div>

      <!-- Recent Reviews Feed -->
      <div class="reviews-section">
        <h2 class="section-title">Recent Reviews</h2>

        <div v-if="entries.length === 0" class="alert alert-info">
          No reviews yet. Be the first to add a bourbon review!
        </div>

        <div v-else class="item-list">
          <div
            v-for="groupEntry in entries"
            :key="groupEntry.id"
            class="item-card review-card clickable"
            @click="openEntryModal(groupEntry.entry.bourbon)"
          >
            <div class="review-content">
              <div class="review-header">
                <h5 class="review-title">
                  {{ groupEntry.entry.bourbon.name }}
                </h5>
                <small class="review-author">
                  by {{ groupEntry.entry.user.name }}
                </small>
              </div>
              <div class="review-rating">
                <span class="star-rating">
                  <span
                    v-for="star in 5"
                    :key="star"
                    :class="{ 'star-empty': star > groupEntry.entry.rating }"
                  >
                    ★
                  </span>
                </span>
                <span v-if="groupEntry.entry.isThumbsUp" class="verdict">
                  👍
                </span>
                <span v-else class="verdict">👎</span>
              </div>
              <p v-if="groupEntry.entry.comment" class="review-comment">
                {{ groupEntry.entry.comment }}
              </p>
              <small class="review-date">
                {{ new Date(groupEntry.createdAt).toLocaleDateString() }}
              </small>
            </div>
            <div v-if="groupEntry.entry.bourbon.imageUrl" class="review-image">
              <img
                :src="groupEntry.entry.bourbon.imageUrl"
                :alt="groupEntry.entry.bourbon.name"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Members Section -->
      <div class="members-section">
        <h2 class="section-title">Members ({{ members.length }})</h2>
        <div class="members-list">
          <span
            v-for="member in members"
            :key="member.id"
            class="badge badge-secondary"
          >
            {{ member.user.name }}
          </span>
        </div>
      </div>
    </div>

    <!-- QR Code Modal -->
    <BaseModal :is-shown="showQRModal" @closed="closeQRModal">
      <template #header>
        <h5 class="modal-title">Share Group</h5>
      </template>
      <div class="modal-content-body">
        <p class="modal-description">
          Scan this QR code or share the link to invite others to
          <strong>{{ group?.name }}</strong>
        </p>
        <div class="qr-code-container">
          <QrcodeVue :value="joinUrl" :size="300" level="H" />
        </div>
        <div class="input-group">
          <input type="text" class="form-input" :value="joinUrl" readonly />
          <button class="btn btn-primary" @click="copyJoinLink">Copy</button>
        </div>
      </div>
    </BaseModal>

    <!-- Entry Modal -->
    <BaseModal :is-shown="showEntryModal" @closed="closeEntryModal">
      <template #header>
        <h5 class="modal-title">{{ selectedBourbon?.name }}</h5>
      </template>
      <div class="modal-content-body text-start">
        <!-- Previous Entries List -->
        <h6 class="section-title mb-3">Previous Reviews</h6>
        <div v-if="loadingEntries" class="text-center py-3">
          <span class="spinner text-secondary"></span>
        </div>
        <div
          v-else-if="bourbonEntries.length === 0"
          class="alert alert-info py-2 mb-4"
        >
          No reviews yet for this bourbon.
        </div>
        <div v-else class="entry-list mb-4">
          <div
            v-for="entry in bourbonEntries"
            :key="entry.id"
            class="d-flex justify-content-between align-items-center py-2 border-bottom"
          >
            <span>{{ entry.user.name }}</span>
            <div class="d-flex gap-1">
              <span
                v-for="n in 5"
                :key="n"
                class="small"
                :class="
                  n <= entry.rating ? 'text-warning' : 'text-muted opacity-25'
                "
                >★</span
              >
            </div>
          </div>
        </div>

        <hr class="divider my-4" />

        <!-- Add New Entry Form -->
        <h6 class="section-title mb-3">Your Review</h6>
        <EntryForm v-model="newEntryData" :errors="entryErrors" />

        <div class="mt-4">
          <button
            class="btn btn-primary w-100"
            :disabled="isSubmittingEntry"
            @click="submitEntry"
          >
            <span
              v-if="isSubmittingEntry"
              class="spinner spinner-sm me-2"
            ></span>
            Submit Review
          </button>
        </div>
      </div>
    </BaseModal>
  </main>
</template>

<style scoped>
.clickable {
  cursor: pointer;
}

.text-start {
  text-align: left;
}

.entry-list {
  max-height: 200px;
  overflow-y: auto;
}

.text-warning {
  color: #ffc107;
}

.text-muted {
  color: #6c757d;
}

.opacity-25 {
  opacity: 0.25;
}

.border-bottom {
  border-bottom: 1px solid #dee2e6;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1rem;
}

.header-content {
  flex: 1;
}

.group-stats {
  color: var(--text-secondary, #666);
  margin-bottom: 0.5rem;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rating-text {
  color: var(--text-secondary, #666);
  font-size: 0.875rem;
}

.reviews-section {
  margin-bottom: 2rem;
}

.review-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.review-content {
  flex: 1;
}

.review-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.review-title {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
  color: var(--text-primary, #1a1a1a);
}

.review-author {
  color: var(--text-secondary, #666);
  font-size: 0.875rem;
}

.review-rating {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.verdict {
  font-size: 1.25rem;
}

.review-comment {
  margin: 0.5rem 0;
  color: var(--text-primary, #1a1a1a);
}

.review-date {
  color: var(--text-secondary, #666);
  font-size: 0.875rem;
}

.review-image {
  flex-shrink: 0;
}

.review-image img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}

.members-section {
  margin-top: 2rem;
}

.members-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.modal-content-body {
  padding: 1rem;
  text-align: center;
}

.modal-description {
  margin-bottom: 1.5rem;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.input-group .form-input {
  flex: 1;
}
</style>
