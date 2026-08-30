<script setup lang="ts">
import { useToast } from '~/composables/useToast';

const { toasts, removeToast } = useToast();

const typeClasses = {
  success: 'bg-swiss-green text-swiss-black',
  error: 'bg-swiss-pink text-swiss-black',
  info: 'bg-swiss-cyan text-swiss-black',
};
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="border-2 border-swiss-black px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,1)] font-bold flex items-center justify-between gap-4 w-72"
        :class="typeClasses[toast.type]"
      >
        <span class="text-sm">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="hover:text-white transition-colors">
          ✕
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
