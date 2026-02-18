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
  primary: 'bg-neo-main hover:bg-lime-400',
  secondary: 'bg-purple-400 hover:bg-purple-300',
  accent: 'bg-neo-accent hover:bg-sky-400',
  danger: 'bg-neo-danger hover:bg-red-300',
  white: 'bg-neo-white hover:bg-gray-100',
  black: 'bg-neo-black text-neo-white hover:bg-gray-800',
};

const sizeClasses = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};
</script>

<template>
  <button
    class="relative font-bold border-3 border-neo-black shadow-neo transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none mb-1 mr-1 flex items-center justify-center gap-2"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      { 'w-full': block, 'opacity-75 cursor-not-allowed': disabled || loading },
    ]"
    :disabled="disabled || loading"
  >
    <div v-if="loading" class="absolute inset-0 flex items-center justify-center bg-inherit">
      <NeoLoader class="scale-[0.4]" />
    </div>
    <span :class="{ invisible: loading }">
      <slot />
    </span>
  </button>
</template>
