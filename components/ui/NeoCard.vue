<script setup lang="ts">
interface Props {
  title?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="bg-neo-white border-3 border-neo-black shadow-neo-lg p-6">
    <h2 v-if="title" class="text-2xl font-black mb-4 border-b-3 border-neo-black pb-2 uppercase tracking-wide">
      {{ title }}
    </h2>
    <slot />
  </div>
</template>
