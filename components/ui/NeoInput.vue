<script setup lang="ts">
interface Props {
  modelValue: string;
  label?: string;
  placeholder?: string;
  type?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: 'TYPE HERE...',
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" class="font-bold text-lg uppercase">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :placeholder="placeholder"
      class="w-full bg-neo-white border-3 border-neo-black p-3 font-bold placeholder:text-gray-500 focus:outline-none focus:bg-neo-bg transition-colors shadow-neo-sm focus:shadow-neo"
    />
  </div>
</template>
