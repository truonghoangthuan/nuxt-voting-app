<script setup lang="ts">
interface Props {
  modelValue: string | number | undefined;
  label?: string;
  placeholder?: string;
  type?: string;
  id?: string;
  min?: string | number;
  max?: string | number;
  required?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: 'Enter value',
  id: () => `app-input-${Math.random().toString(36).substring(2, 9)}`,
  required: false
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | undefined): void;
}>();

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const val = target.value;
  if (props.type === 'number') {
    emit('update:modelValue', val === '' ? undefined : Number(val));
  } else {
    emit('update:modelValue', val);
  }
};
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" :for="id" class="font-medium text-sm text-black cursor-pointer">{{ label }}</label>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :min="min"
      :max="max"
      :required="required"
      @input="handleInput"
      :placeholder="placeholder"
      class="w-full bg-white border border-[#eaeaea] px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors duration-200 rounded-none"
    />
  </div>
</template>
