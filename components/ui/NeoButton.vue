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
  primary: 'bg-swiss-yellow text-swiss-black border-2 border-swiss-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]',
  secondary: 'bg-white text-swiss-black border-2 border-swiss-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]',
  accent: 'bg-swiss-pink text-swiss-black border-2 border-swiss-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]',
  danger: 'bg-red-500 text-white border-2 border-swiss-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]',
  white: 'bg-white text-swiss-black border-2 border-swiss-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]',
  black: 'bg-swiss-black text-white border-2 border-swiss-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)]',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
</script>

<template>
  <button
    class="relative font-bold transition-all duration-200 ease-out flex items-center justify-center gap-2 rounded-none"
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
