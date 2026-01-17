<script setup lang="ts">
import { ref, watch, useSlots } from "vue";

const slots = useSlots();

const prop = defineProps({
  isShown: {
    type: Boolean,
    default: false,
  },
  isDisableClosingOnMask: {
    type: Boolean,
    default: false,
  },
  disableScrolling: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["closed"]);
const isShownComplete = ref(false);

function close() {
  emit("closed");
}
function closeFromMask() {
  if (prop.isDisableClosingOnMask) {
    return;
  }
  close();
}
watch(
  () => prop.isShown,
  () => {
    function disableScroll() {
      document.body.style.overflow = "hidden";
    }
    function enableScroll() {
      document.body.style.overflow = "auto";
    }
    if (prop.isShown) {
      if (!prop.disableScrolling) {
        disableScroll();
      }
      setTimeout(() => {
        isShownComplete.value = true;
      }, 250); // Changed from 100ms to 250ms to match the modal backdrop display time
    } else {
      enableScroll();
      isShownComplete.value = false;
    }
  }
);
</script>

<template>
  <Transition name="modal-fade">
    <div
      v-if="isShown"
      class="modal"
      tabindex="-1"
      :class="{ show: isShownComplete }"
      @click.self="closeFromMask"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div v-if="slots.header" class="modal-header">
            <slot name="header"></slot>
          </div>
          <div class="modal-body">
            <slot></slot>
          </div>
          <div v-if="slots.footer" class="modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.modal-dialog {
  position: relative;
  z-index: 1055;
  width: auto;
  margin: 0.5rem; // 8px
  pointer-events: none;
  transform: translate(0, -50px);
  opacity: 0;
  transition: transform 0.3s ease-out, opacity 0.3s ease-out;

  @include bp-sm-phone-landscape {
    max-width: 500px;
    margin-top: 1.75rem; // 28px
    margin-right: auto;
    margin-left: auto;
    margin-bottom: 1.75rem; // 28px
  }
}

.modal.show .modal-dialog {
  transform: translate(0, 0);
  opacity: 1;
}

.modal-fade-enter-active {
  transition: opacity 0.25s ease;
}

.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  .modal-dialog {
    transform: translate(0, -50px);
    opacity: 0;
    transition: transform 0.15s ease-out, opacity 0.15s ease-out;
  }
}

.modal {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1055;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: rgba($color: #000, $alpha: 25%);
  backdrop-filter: blur(rem(10));
  outline: 0;
}

.modal-header {
  padding: rem(16);
}

.modal-content {
  pointer-events: auto;
  background-color: #fff;
  @include shadow-2();
}
</style>
