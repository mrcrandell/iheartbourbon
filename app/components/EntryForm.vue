<script setup lang="ts">
import type { ValidationErrorItem } from "joi";

const props = defineProps({
  modelValue: {
    type: Object as PropType<{
      rating: number;
      isThumbsUp: boolean;
      comment: string;
      groupIds: string[];
    }>,
    required: true,
  },
  errors: {
    type: Object as PropType<Record<string, string>>,
    default: () => ({}),
  },
  isLoadingGroups: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const internalData = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const loadingGroups = ref(false);
const availableGroups = ref<{ id: string; name: string }[]>([]);

async function loadGroups() {
  loadingGroups.value = true;
  try {
    const data = await $fetch<{ id: string; name: string }[]>("/api/groups");
    availableGroups.value = data || [];

    // Select all groups by default
    if (
      availableGroups.value.length > 0 &&
      internalData.value.groupIds.length === 0
    ) {
      internalData.value = {
        ...internalData.value,
        groupIds: availableGroups.value.map((g) => g.id),
      };
    }
  } catch (e) {
    console.error("Failed to load groups", e);
  } finally {
    loadingGroups.value = false;
  }
}

onMounted(() => {
  loadGroups();
});
</script>

<template>
  <div class="entry-form">
    <!-- Rating -->
    <div class="form-group">
      <label class="form-label"> Rating <span class="required">*</span> </label>
      <div class="rating-input">
        <button
          v-for="star in 5"
          :key="star"
          type="button"
          class="btn star-btn"
          :class="internalData.rating >= star ? 'btn-primary' : 'btn-outline'"
          @click="internalData.rating = star"
        >
          ★
        </button>
      </div>
      <div v-if="internalData.rating" class="rating-label">
        {{
          [null, "Poor", "Fair", "Average", "Very Good", "Excellent"][
            internalData.rating
          ]
        }}
      </div>
      <div v-if="errors.rating" class="error-feedback">
        {{ errors.rating }}
      </div>
    </div>

    <!-- Verdict -->
    <div class="form-group">
      <label class="form-label">Verdict</label>
      <div class="verdict-input">
        <label
          class="btn"
          :class="
            internalData.isThumbsUp ? 'btn-primary' : 'btn-outline-secondary'
          "
        >
          <input
            v-model="internalData.isThumbsUp"
            type="radio"
            class="sr-only"
            name="thumbs"
            :value="true"
          />
          Thumbs Up 👍
        </label>
        <label
          class="btn"
          :class="
            !internalData.isThumbsUp ? 'btn-primary' : 'btn-outline-secondary'
          "
        >
          <input
            v-model="internalData.isThumbsUp"
            type="radio"
            class="sr-only"
            name="thumbs"
            :value="false"
          />
          Thumbs Down 👎
        </label>
      </div>
    </div>

    <!-- Comment -->
    <div class="form-group">
      <label for="comment" class="form-label">Comment</label>
      <textarea
        id="comment"
        v-model="internalData.comment"
        class="form-input"
        :class="{ 'is-invalid': errors.comment }"
        rows="3"
        placeholder="What did you think?"
      />
      <div v-if="errors.comment" class="error-feedback">
        {{ errors.comment }}
      </div>
    </div>

    <!-- Groups -->
    <div class="form-group">
      <label class="form-label">Post to Groups</label>
      <div v-if="loadingGroups" class="text-muted">Loading groups...</div>
      <div v-else-if="availableGroups.length === 0" class="text-muted">
        You are not a member of any groups.
      </div>
      <div v-else class="groups-list">
        <label
          v-for="group in availableGroups"
          :key="group.id"
          class="group-checkbox"
        >
          <input
            v-model="internalData.groupIds"
            type="checkbox"
            :value="group.id"
          />
          <span class="group-name">{{ group.name }}</span>
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rating-input {
  display: flex;
  gap: 0.25rem;
}

.star-btn {
  font-size: 1.5rem;
  padding: 0.25rem 0.5rem;
  line-height: 1;
}

.btn-outline {
  border: 1px solid #ccc;
  background: white;
  color: #ccc;
}
.btn-outline:hover {
  border-color: var(--primary, #0066cc);
  color: var(--primary, #0066cc);
}

.rating-label {
  margin-top: 0.25rem;
  font-size: 0.875rem;
  color: var(--text-secondary, #666);
}

.verdict-input {
  display: flex;
  gap: 0.5rem;
}

.groups-list {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.group-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.bg-white {
  background-color: white;
}
.btn-outline-secondary {
  border: 1px solid #ccc;
  background-color: #fff;
  color: #333;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
