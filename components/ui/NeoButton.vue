<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'white' | 'black';
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  loading?: boolean;
  icon?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'white',
  size: 'md',
  block: false,
  loading: false,
  disabled: false,
});

const variantClasses = {
  primary: 'bg-black text-white hover:bg-gray-800',
  secondary: 'bg-white text-black border border-gray-200 hover:bg-gray-50',
  accent: 'bg-black text-white hover:bg-gray-800',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  white: 'bg-white text-black border border-gray-200 hover:bg-gray-50',
  black: 'bg-black text-white hover:bg-gray-800',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
</script>

<template>
  <button
    class="relative font-medium transition-colors flex items-center justify-center gap-2 rounded-[4px]"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      { 'w-full': block, 'opacity-50 cursor-not-allowed': disabled || loading },
    ]"
    :disabled="disabled || loading"
  >
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-inherit rounded-[4px]">
      <NeoLoader class="scale-[0.5]" />
    </div>
    <span :class="{ invisible: loading }">
      <slot />
    </span>
  </button>
</template>
