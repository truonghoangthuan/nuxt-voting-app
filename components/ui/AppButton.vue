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
  primary: 'bg-claude-text text-claude-bg border-transparent hover:bg-black',
  secondary: 'bg-transparent text-claude-text border-claude-border hover:bg-claude-card',
  accent: 'bg-claude-accent text-white border-transparent hover:brightness-110',
  danger: 'bg-red-500 text-white border-transparent hover:bg-red-600',
  white: 'bg-white text-claude-text border-claude-border hover:bg-gray-50',
  black: 'bg-claude-text text-claude-bg border-transparent hover:bg-black',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};
</script>

<template>
  <button
    class="relative font-medium transition-all duration-200 flex items-center justify-center gap-2 rounded-lg border"
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
