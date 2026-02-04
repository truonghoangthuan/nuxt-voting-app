<script setup lang="ts">
import { useUser } from '../composables/useUser';

const { userName, setUserName, init } = useUser();
const inputName = ref('');
const isOpen = ref(false);

onMounted(() => {
  init();
  if (!userName.value) {
    isOpen.value = true;
  }
});

const handleSubmit = () => {
  if (inputName.value.trim()) {
    setUserName(inputName.value.trim());
    isOpen.value = false;
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-neo-black/90 backdrop-blur-md"></div>

    <!-- Dialog Content -->
    <div class="relative z-10 w-full max-w-lg" v-motion-pop>
      <NeoCard title="Welcome!">
        <div class="flex flex-col gap-6">
          <p class="text-xl">
            It looks like you're new here! <br />
            What should we call you?
          </p>

          <NeoInput
            v-model="inputName"
            label="Your Name"
            placeholder="e.g. Satoshi Nakamoto"
            @keyup.enter="handleSubmit"
          />

          <div class="flex justify-end">
            <NeoButton variant="black" @click="handleSubmit" :disabled="!inputName.trim()"> LET'S GO </NeoButton>
          </div>
        </div>
      </NeoCard>
    </div>
  </div>
</template>
