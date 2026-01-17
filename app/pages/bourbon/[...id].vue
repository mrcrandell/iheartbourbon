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
});
</script>

<template>
  <main class="main content">
    <div class="page-container">
      <h1 class="page-title">{{ pageTitle }}</h1>

      <form @submit.prevent="submitForm">
        <!-- Bourbon Details -->
        <div class="section-container">
          <div class="form-card">
            <h2 class="section-title">Bourbon Details</h2>
            <div class="form-group">
              <label for="name" class="form-label">
                Bourbon Name <span class="required">*</span>
              </label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                class="form-input"
                :class="{ 'is-invalid': errors.name }"
                placeholder="e.g. Buffalo Trace"
              />
              <div v-if="errors.name" class="error-feedback">
                {{ errors.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Entry Details (Add Mode Only) -->
        <div v-if="isAddMode" class="section-container">
          <div class="form-card">
            <h2 class="section-title">Your Review</h2>
            <EntryForm v-model="formData" :errors="errors" />
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" :disabled="isLoading">
            <span v-if="isLoading" class="spinner spinner-sm" />
            {{ submitText }}
          </button>
          <button type="button" class="btn btn-secondary" @click="cancel">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
.section-container {
  margin-bottom: 2rem;
}
</style>
