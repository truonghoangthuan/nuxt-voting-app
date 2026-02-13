<script setup lang="ts">
interface Props {
  modelValue: string;
  label?: string;
  placeholder?: string;
  type?: string;
  id?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: 'TYPE HERE...',
  id: () => `neo-input-${Math.random().toString(36).substring(2, 9)}`,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.value);
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" :for="id" class="font-bold text-lg uppercase cursor-pointer">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      class="w-full bg-neo-white border-3 border-neo-black p-3 font-bold placeholder:text-gray-500 focus:outline-none focus:bg-neo-bg transition-colors shadow-neo-sm focus:shadow-neo"
    />
  </div>
</template>
