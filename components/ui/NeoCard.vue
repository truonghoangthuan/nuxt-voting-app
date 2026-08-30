<script setup lang="ts">
interface Props {
  title?: string;
  showShare?: boolean;
}

const props = defineProps<Props>();
const copied = ref(false);

const handleShare = () => {
  if (import.meta.server) return;
  navigator.clipboard.writeText(window.location.href);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

<template>
  <div class="bg-white border border-gray-200 p-8">
    <div v-if="title" class="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
      <h2 class="text-xl font-medium tracking-tight flex-grow">
        {{ title }}
      </h2>
      <button
        v-if="showShare"
        @click="handleShare"
        class="flex items-center gap-2 px-3 py-1.5 font-medium text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors rounded-sm"
      >
        <span v-if="!copied">Share</span>
        <span v-else>Copied</span>
        <svg
          v-if="!copied"
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
          <polyline points="16 6 12 2 8 6"></polyline>
          <line x1="12" y1="2" x2="12" y2="15"></line>
        </svg>
      </button>
    </div>
    <slot />
  </div>
</template>
