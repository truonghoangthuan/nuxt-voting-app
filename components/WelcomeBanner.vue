<script setup lang="ts">
import { useUser } from '../composables/useUser';

const { userName } = useUser();
</script>

<template>
  <div v-if="userName" class="fixed top-4 right-4 z-40 max-w-[200px]" v-motion-slide-top>
    <div
      class="bg-neo-accent border-3 border-neo-black p-3 shadow-neo transition-all duration-300 hover:scale-110 hover:-rotate-3 hover:bg-neo-danger hover:shadow-neo-lg group cursor-help"
    >
      <div class="font-black text-sm uppercase tracking-wider mb-1 group-hover:text-neo-white">Welcome,</div>
      <div class="font-black text-xl truncate group-hover:text-neo-white font-mono">
        {{ userName }}
      </div>

      <!-- Decorative elements -->
      <div
        class="absolute -top-2 -right-2 w-4 h-4 bg-neo-main border-2 border-neo-black rounded-full hidden group-hover:block animate-bounce"
      ></div>
      <div
        class="absolute -bottom-2 -left-2 w-3 h-3 bg-neo-white border-2 border-neo-black rotate-45 hidden group-hover:block animate-spin"
      ></div>
    </div>
  </div>
</template>
