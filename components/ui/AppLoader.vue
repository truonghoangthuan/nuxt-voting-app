<template>
  <div class="flex items-center justify-center gap-1.5">
    <div
      v-for="(color, index) in colors"
      :key="index"
      class="w-2 h-2 rounded-none animate-pulse"
      :class="color"
      :style="{ animationDelay: `${index * 150}ms` }"
    ></div>
  </div>
</template>

<script setup lang="ts">
const colors = ['bg-gray-400', 'bg-gray-500', 'bg-gray-600'];
</script>
