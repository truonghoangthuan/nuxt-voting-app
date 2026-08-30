<script setup lang="ts">
interface Props {
  modelValue: string | number;
  label?: string;
  placeholder?: string;
  type?: string;
  id?: string;
  min?: string | number;
  max?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: 'Enter value',
  id: () => `neo-input-${Math.random().toString(36).substring(2, 9)}`,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void;
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = target.value;
  if (props.type === 'number') {
    emit('update:modelValue', val === '' ? val : Number(val));
  } else {
    emit('update:modelValue', val);
  }
};
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="font-medium text-sm text-gray-700 cursor-pointer">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :min="min"
      :max="max"
      @input="handleInput"
      :placeholder="placeholder"
      class="w-full bg-white border-2 border-swiss-black px-3 py-2 font-medium text-sm placeholder:text-gray-400 focus:outline-none focus:shadow-[4px_4px_0px_rgba(0,0,0,1)] focus:-translate-x-[2px] focus:-translate-y-[2px] transition-all duration-200 rounded-none"
    />
  </div>
</template>
