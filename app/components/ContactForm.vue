<script setup>
const alert = ref({
  show: false,
  status: "",
  message: "",
});
const name = ref("");
const email = ref("");
const phone = ref("");
const messageText = ref("");
const token = ref(null);
const turnstileRef = ref(null);
const isLoading = ref(false);
const errorsRaw = ref([]);

const errors = computed(() => {
  const errors = {};
  errorsRaw.value.forEach((error) => {
    const [field] = error.path;
    errors[field] = error.message;
  });
  return errors;
});

const submitText = computed(() => {
  return isLoading.value ? "Sending..." : "Send Message";
});

async function submitForm() {
  errorsRaw.value = [];
  isLoading.value = true;

  const formData = {
    name: name.value,
    email: email.value,
    phone: phone.value,
    message: messageText.value,
    token: token.value,
  };

  const { error } = contactValidationSchema.validate(formData, {
    abortEarly: false,
  });

  if (error) {
    isLoading.value = false;
    alert.value = {
      show: true,
      status: "danger",
      message: "Please correct the errors in red on the form.",
    };
    errorsRaw.value = error.details;
    return;
  }

  try {
    const data = await $fetch("/api/contact", {
      method: "POST",
      body: formData,
    });

    alert.value = {
      show: true,
      status: "success",
      message: data.message,
    };
    name.value = "";
    email.value = "";
    phone.value = "";
    messageText.value = "";
  } catch (error) {
    alert.value = {
      show: true,
      status: "danger",
      message: "Please correct the errors in red on the form.",
    };
    errorsRaw.value = Array.isArray(error?.data)
      ? error?.data
      : [{ path: ["form"], message: error?.data?.message || "Unknown error" }];
  } finally {
    isLoading.value = false;
    turnstileRef.value?.reset();
  }
}
</script>

<template>
  <div class="contact-form">
    <form method="post" @submit.prevent="submitForm($event)">
      <div
        v-if="alert.show"
        class="alert"
        role="alert"
        :class="'alert-' + alert.status"
      >
        {{ alert.message }}
      </div>

      <div class="form-group">
        <label class="form-label sr-only" for="contact-name">Name *</label>
        <input
          id="contact-name"
          v-model="name"
          type="text"
          class="form-control"
          name="name"
          :class="{ 'is-invalid': errors.name }"
          placeholder="Enter Your Name"
        />
        <div v-if="errors.name" class="invalid-feedback">
          {{ errors.name }}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label sr-only" for="contact-email">Email *</label>
        <input
          id="contact-email"
          v-model="email"
          type="email"
          class="form-control"
          name="email"
          :class="{ 'is-invalid': errors.email }"
          placeholder="Enter Email Address"
        />
        <div v-if="errors.email" class="invalid-feedback">
          {{ errors.email }}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label sr-only" for="contact-phone">Phone *</label>
        <input
          id="contact-phone"
          v-model="phone"
          type="tel"
          class="form-control"
          name="phone"
          :class="{ 'is-invalid': errors.phone }"
          placeholder="Enter Phone Number"
        />
        <div v-if="errors.phone" class="invalid-feedback">
          {{ errors.phone }}
        </div>
      </div>

      <div class="form-group">
        <label class="form-label sr-only" for="message-text">Message *</label>
        <textarea
          id="message-text"
          v-model="messageText"
          name="message"
          class="form-control"
          rows="6"
          :class="{ 'is-invalid': errors.message }"
          placeholder="Enter Message"
        ></textarea>
        <div v-if="errors.message" class="invalid-feedback">
          {{ errors.message }}
        </div>
      </div>

      <NuxtTurnstile ref="turnstileRef" v-model="token" />

      <div class="form-group form-group-submit">
        <button
          type="submit"
          class="btn btn-submit btn-primary"
          :disabled="isLoading"
        >
          <transition name="slide-fade" mode="out-in">
            <span :key="submitText">{{ submitText }}</span>
          </transition>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.contact-form {
  width: 100%;
}

.form-group-submit {
  margin-top: 1.5rem;
}

.btn-submit {
  min-width: 120px;
  width: 100%;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateY(-10px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>
