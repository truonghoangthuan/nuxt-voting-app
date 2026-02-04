<script setup lang="ts">
import { useVModel } from '@vueuse/core';

interface Props {
  modelValue: boolean;
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
});

const emit = defineEmits(['update:modelValue', 'close']);

const isOpen = useVModel(props, 'modelValue', emit);

const close = () => {
  isOpen.value = false;
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-neo-black/50 backdrop-blur-sm" @click="close"></div>

    <!-- Dialog Content -->
    <div class="relative z-10 w-full max-w-lg" v-motion-pop>
      <NeoCard :title="title">
        <slot />
        <div class="mt-6 flex justify-end">
          <NeoButton variant="primary" @click="close">Got it!</NeoButton>
        </div>
      </NeoCard>
    </div>
  </div>
</template>
