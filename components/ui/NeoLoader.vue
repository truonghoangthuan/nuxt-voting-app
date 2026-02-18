<template>
  <div class="flex items-center justify-center gap-3">
    <div
      v-for="(color, index) in colors"
      :key="index"
      class="w-5 h-5 border-3 border-neo-black shadow-neo animate-bounce-spin"
      :class="color"
      :style="{ animationDelay: `${index * 150}ms` }"
    ></div>
  </div>
</template>

<script setup lang="ts">
const colors = ['bg-neo-main', 'bg-neo-accent', 'bg-neo-danger'];
</script>

<style scoped>
@keyframes bounce-spin {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.animate-bounce-spin {
  animation: bounce-spin 1.2s infinite ease-in-out;
}
</style>
