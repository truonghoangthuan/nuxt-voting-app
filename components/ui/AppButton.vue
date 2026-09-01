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
  primary: 'bg-swiss-yellow text-black border border-[#eaeaea] hover:bg-yellow-300',
  secondary: 'bg-white text-black border border-[#eaeaea] hover:bg-gray-50',
  accent: 'bg-swiss-cyan text-black border border-[#eaeaea] hover:bg-cyan-300',
  danger: 'bg-red-500 text-white border border-red-600 hover:bg-red-600',
  white: 'bg-white text-black border border-[#eaeaea] hover:bg-gray-50',
  black: 'bg-black text-white border border-black hover:bg-gray-800',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
</script>

<template>
  <button
    class="relative font-medium transition-colors duration-200 flex items-center justify-center gap-2 rounded-none"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      { 'w-full': block, 'opacity-50 cursor-not-allowed': disabled || loading },
    ]"
    :disabled="disabled || loading"
  >
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-inherit">
      <AppLoader class="scale-[0.5]" />
    </div>
    <span :class="{ invisible: loading }">
      <slot />
    </span>
  </button>
</template>
