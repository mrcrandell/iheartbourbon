<script setup lang="ts">
import { ref, computed } from "vue";
import type { ValidationErrorItem } from "joi";
import { registrationSchema } from "../utils/schemas";

const emit = defineEmits(["success"]);

const form = ref({
  name: "",
  email: "",
  password: "",
});

const alert = ref({
  show: false,
  status: "",
  message: "",
});

const isLoading = ref(false);
const errorsRaw = ref<ValidationErrorItem[]>([]);

const errors = computed(() => {
  const errs: Record<string, string> = {};
  errorsRaw.value.forEach((error) => {
    const [field] = error.path;
    if (field) {
      errs[String(field)] = error.message;
    }
  });
  return errs;
});

async function submitForm() {
  errorsRaw.value = [];
  isLoading.value = true;
  alert.value.show = false;

  const { error } = registrationSchema.validate(form.value, {
    abortEarly: false,
  });

  if (error) {
    isLoading.value = false;
    errorsRaw.value = error.details;
    return;
  }

  try {
    await $fetch("/api/users/register", {
      method: "POST",
      body: form.value,
    });

    alert.value = {
      show: true,
      status: "success",
      message: "Account created successfully!",
    };
    emit("success");
    // Reload to refresh session
    window.location.reload();
  } catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string } };
    alert.value = {
      show: true,
      status: "danger",
      message: error.data?.statusMessage || "Registration failed.",
    };
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <div class="auth-register">
    <div class="social-login">
      <a href="/auth/google" class="btn btn-social btn-google">
        Sign in with Google
      </a>
      <a href="/auth/facebook" class="btn btn-social btn-facebook">
        Sign in with Facebook
      </a>
      <!-- <a href="/auth/apple" class="btn btn-social btn-apple">
        Sign in with Apple
      </a> -->
    </div>

    <div class="divider">
      <span>OR</span>
    </div>

    <form @submit.prevent="submitForm">
      <div v-if="alert.show" class="alert" :class="'alert-' + alert.status">
        {{ alert.message }}
      </div>

      <div class="form-group">
        <label class="form-label" for="name">Name</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="form-control"
          :class="{ 'is-invalid': errors.name }"
        />
        <div v-if="errors.name" class="invalid-feedback">
          {{ errors.name }}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="email">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="form-control"
          :class="{ 'is-invalid': errors.email }"
        />
        <div v-if="errors.email" class="invalid-feedback">
          {{ errors.email }}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="password">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="form-control"
          :class="{ 'is-invalid': errors.password }"
        />
        <div v-if="errors.password" class="invalid-feedback">
          {{ errors.password }}
        </div>
      </div>

      <div class="form-group mt-4">
        <button
          type="submit"
          class="btn btn-primary w-100"
          :disabled="isLoading"
        >
          {{ isLoading ? "Creating Account..." : "Create Account" }}
        </button>
      </div>
    </form>
  </div>
</template>

<style lang="scss" scoped>
.auth-register {
  padding: 1rem;
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.btn-social {
  width: 100%;
  text-align: center;
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  padding: 0.75rem;
  text-decoration: none;
  border-radius: rem(4);
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f8f9fa;
    text-decoration: none;
  }
}

.btn-google {
  // Add specific branding colors if desired
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;
  color: #6c757d;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #ddd;
  }

  span {
    padding: 0 1rem;
    font-size: 0.9em;
    text-transform: uppercase;
  }
}

.form-group {
  margin-bottom: 1rem;
}

.w-100 {
  width: 100%;
}

.mt-4 {
  margin-top: 1.5rem;
}
</style>
