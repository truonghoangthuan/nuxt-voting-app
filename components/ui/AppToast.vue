<script setup lang="ts">
import { useToast } from '~/composables/useToast';

const { toasts, removeToast } = useToast();

const typeClasses = {
  success: 'bg-white text-black border-l-4 border-swiss-green',
  error: 'bg-white text-black border-l-4 border-red-500',
  info: 'bg-white text-black border-l-4 border-swiss-cyan',
};
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="border border-[#eaeaea] px-4 py-3 font-medium flex items-center justify-between gap-4 w-72 bg-white"
        :class="typeClasses[toast.type]"
      >
        <span class="text-sm text-black">{{ toast.message }}</span>
        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-black transition-colors">
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
