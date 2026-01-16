<script setup lang="ts">
import {
  bourbonAndEntryValidation,
  bourbonValidation,
} from "~~/shared/utils/validation";
import type { ValidationErrorItem } from "joi";

definePageMeta({
  middleware: ["auth" as any],
});

const route = useRoute();
const router = useRouter();

// 1. Logic similar to [...slug].vue for ID detection
const bourbonId = computed(() =>
  route.params.id?.[0] === "add" ? null : route.params.id?.[0]
);

const isAddMode = computed(() => !bourbonId.value);
const pageTitle = computed(() =>
  isAddMode.value ? "Add New Bourbon" : "Edit Bourbon"
);
const submitText = computed(() => {
  if (isLoading.value) return "Saving...";
  return isAddMode.value ? "Add Bourbon & Review" : "Update Bourbon";
});

// 2. State Management matching reference structure
const isLoading = ref(false);
const loadingGroups = ref(false);
const availableGroups = ref<{ id: string; name: string }[]>([]);
const errorsRaw = ref<ValidationErrorItem[]>([]);

const formData = ref({
  name: "",
  imageUrl: "",
  // Entry fields (Add mode only)
  rating: 5,
  comment: "",
  isThumbsUp: true,
  groupIds: [] as string[],
});

// Computed errors map for UI
const errors = computed(() => {
  const errs: Record<string, string> = {};
  errorsRaw.value.forEach((error) => {
    const [field] = error.path;
    if (field) errs[String(field)] = error.message;
  });
  return errs;
});

// 3. Data Loading
async function loadGroups() {
  if (!isAddMode.value) return;
  loadingGroups.value = true;
  try {
    const data = await $fetch<{ id: string; name: string }[]>("/api/groups");
    availableGroups.value = data || [];
  } catch (e) {
    console.error("Failed to load groups", e);
  } finally {
    loadingGroups.value = false;
  }
}

async function loadBourbon() {
  if (!bourbonId.value) return;

  try {
    const data = await $fetch<{ bourbon: { name: string; imageUrl?: string } }>(
      `/api/bourbons/${bourbonId.value}`
    );
    if (data && data.bourbon) {
      formData.value.name = data.bourbon.name;
      formData.value.imageUrl = data.bourbon.imageUrl || "";
    }
  } catch (e) {
    console.error("Failed to load bourbon", e);
    // router.push("/404");
  }
}

// 4. Submission Logic
async function submitForm() {
  errorsRaw.value = [];
  isLoading.value = true;

  // Select Schema based on mode
  const schema = isAddMode.value
    ? bourbonAndEntryValidation
    : bourbonValidation;

  // Prepare payload for validation
  const dataToValidate = {
    name: formData.value.name,
    imageUrl: formData.value.imageUrl,
    ...(isAddMode.value
      ? {
          rating: Number(formData.value.rating),
          comment: formData.value.comment,
          isThumbsUp: Boolean(formData.value.isThumbsUp),
          groupIds: formData.value.groupIds,
        }
      : {}),
  };

  const { error } = schema.validate(dataToValidate, { abortEarly: false });

  if (error) {
    errorsRaw.value = error.details;
    isLoading.value = false;
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  try {
    if (isAddMode.value) {
      // 1. Create Bourbon
      const { bourbon } = await $fetch<{ bourbon: { id: string } }>(
        "/api/bourbons",
        {
          method: "POST",
          body: {
            name: formData.value.name,
            imageUrl: formData.value.imageUrl,
          },
        }
      );

      // 2. Create Entry using the new bourbon ID
      await $fetch("/api/entries", {
        method: "POST",
        body: {
          bourbonId: bourbon.id,
          rating: Number(formData.value.rating),
          comment: formData.value.comment,
          isThumbsUp: Boolean(formData.value.isThumbsUp),
          groupIds: formData.value.groupIds,
        },
      });
    } else {
      await $fetch(`/api/bourbons/${bourbonId.value}`, {
        method: "PUT",
        body: {
          name: formData.value.name,
          imageUrl: formData.value.imageUrl,
        },
      });
    }
    router.push("/");
  } catch (err: any) {
    console.error("Submission error:", err);
    alert(err.data?.message || err.statusMessage || "An error occurred");
  } finally {
    isLoading.value = false;
  }
}

function cancel() {
  router.back();
}

onMounted(() => {
  loadBourbon();
  loadGroups();
});
</script>

<template>
  <main class="main add-page container py-4">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <h1 class="mb-4">{{ pageTitle }}</h1>

        <form @submit.prevent="submitForm">
          <!-- Bourbon Details -->
          <div class="card mb-4 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="mb-0">Bourbon Details</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label for="name" class="form-label"
                  >Bourbon Name <span class="text-danger">*</span></label
                >
                <input
                  id="name"
                  v-model="formData.name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  placeholder="e.g. Buffalo Trace"
                />
                <div v-if="errors.name" class="invalid-feedback">
                  {{ errors.name }}
                </div>
              </div>

              <!-- <div class="mb-3">
                <label for="imageUrl" class="form-label"
                  >Image URL <span class="text-muted">(Optional)</span></label
                >
                <input
                  id="imageUrl"
                  v-model="formData.imageUrl"
                  type="url"
                  class="form-control"
                  :class="{ 'is-invalid': errors.imageUrl }"
                  placeholder="https://example.com/image.jpg"
                />
                <div v-if="errors.imageUrl" class="invalid-feedback">
                  {{ errors.imageUrl }}
                </div>
              </div> -->
            </div>
          </div>

          <!-- Entry Details (Add Mode Only) -->
          <div v-if="isAddMode" class="card mb-4 shadow-sm">
            <div class="card-header bg-white">
              <h5 class="mb-0">Your Review</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label d-block"
                  >Rating <span class="text-danger">*</span></label
                >
                <div class="btn-group" role="group">
                  <button
                    v-for="star in 5"
                    :key="star"
                    type="button"
                    class="btn"
                    :class="
                      formData.rating >= star
                        ? 'btn-warning'
                        : 'btn-outline-secondary'
                    "
                    @click="formData.rating = star"
                  >
                    ★
                  </button>
                </div>
                <div v-if="formData.rating" class="mt-1 small">
                  {{
                    [null, "Poor", "Fair", "Average", "Very Good", "Excellent"][
                      formData.rating
                    ]
                  }}
                </div>
                <div v-if="errors.rating" class="text-danger small mt-1">
                  {{ errors.rating }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label d-block">Verdict</label>
                <div class="btn-group" role="group">
                  <input
                    id="thumbsUp"
                    v-model="formData.isThumbsUp"
                    type="radio"
                    class="btn-check"
                    name="thumbs"
                    :value="true"
                    autocomplete="off"
                  />
                  <label class="btn btn-outline-success" for="thumbsUp"
                    >Thumbs Up 👍</label
                  >

                  <input
                    id="thumbsDown"
                    v-model="formData.isThumbsUp"
                    type="radio"
                    class="btn-check"
                    name="thumbs"
                    :value="false"
                    autocomplete="off"
                  />
                  <label class="btn btn-outline-danger" for="thumbsDown"
                    >Thumbs Down 👎</label
                  >
                </div>
              </div>

              <div class="mb-3">
                <label for="comment" class="form-label">Comment</label>
                <textarea
                  id="comment"
                  v-model="formData.comment"
                  class="form-control"
                  rows="3"
                  :class="{ 'is-invalid': errors.comment }"
                  placeholder="What did you think?"
                />
                <div v-if="errors.comment" class="invalid-feedback">
                  {{ errors.comment }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Post to Groups</label>
                <div v-if="loadingGroups" class="text-muted small">
                  Loading groups...
                </div>
                <div
                  v-else-if="availableGroups.length === 0"
                  class="text-muted small"
                >
                  You are not a member of any groups.
                </div>
                <div v-else class="d-flex flex-wrap gap-3">
                  <div
                    v-for="group in availableGroups"
                    :key="group.id"
                    class="form-check"
                  >
                    <input
                      :id="'group-' + group.id"
                      v-model="formData.groupIds"
                      type="checkbox"
                      class="form-check-input"
                      :value="group.id"
                    />
                    <label class="form-check-label" :for="'group-' + group.id">
                      {{ group.name }}
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="isLoading">
              <span
                v-if="isLoading"
                class="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              />
              {{ submitText }}
            </button>
            <button type="button" class="btn btn-secondary" @click="cancel">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
</template>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
}
.btn-group .btn {
  font-size: 1.25rem;
}
</style>
