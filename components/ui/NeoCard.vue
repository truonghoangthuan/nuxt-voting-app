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
  <div class="bg-neo-white border-3 border-neo-black shadow-neo-lg p-6">
    <div v-if="title" class="flex justify-between items-center mb-4 border-b-3 border-neo-black pb-2">
      <h2 class="text-2xl font-black uppercase tracking-wide flex-grow">
        {{ title }}
      </h2>
      <button
        v-if="showShare"
        @click="handleShare"
        class="flex items-center gap-2 px-3 py-1 font-bold text-sm bg-neo-accent border-2 border-neo-black shadow-neo-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all active:bg-neo-main"
      >
        <span v-if="!copied">SHARE</span>
        <span v-else>COPIED!</span>
        <svg
          v-if="!copied"
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
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
