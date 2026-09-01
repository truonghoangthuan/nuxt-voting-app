<script setup lang="ts">
const emit = defineEmits<{
  (e: 'upload', content: string): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const triggerUpload = () => {
  fileInput.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      emit('upload', content);
      // Reset input so same file can be selected again
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };
    reader.readAsText(file);
  }
};
</script>

<template>
  <div>
    <input ref="fileInput" type="file" accept=".txt,.csv" class="hidden" @change="handleFileChange" />
    <AppButton variant="secondary" @click="triggerUpload">
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>Upload Options</span>
      </div>
    </AppButton>
  </div>
</template>
