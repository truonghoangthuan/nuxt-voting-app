<script setup lang="ts">
const question = ref('');
const options = ref(['', '']);
const showHelp = ref(false);
const { createPoll } = usePolls();
const router = useRouter();

const addOption = () => {
  options.value.push('');
};

const removeOption = (index: number) => {
  if (options.value.length > 2) {
    options.value.splice(index, 1);
  }
};

const handleFileUpload = (content: string) => {
  const newOptions = content
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o);
  if (newOptions.length > 0) {
    // Determine if we should append or replace.
    // Logic: If there are only empty options (initial state), replace them.
    // Otherwise, append.
    const hasExistingContent = options.value.some((o) => o.trim() !== '');

    if (!hasExistingContent) {
      options.value = newOptions;
    } else {
      options.value.push(...newOptions);
    }

    // Ensure we have at least 2 empty options if the result is too short (though unlikely with file upload)
    while (options.value.length < 2) {
      options.value.push('');
    }
  }
};

const handleCreate = async () => {
  const validOptions = options.value.filter((o) => o.trim());
  if (question.value.trim() && validOptions.length >= 2) {
    const id = await createPoll(question.value, validOptions);
    if (id) {
      router.push(`/vote/${id}`);
    }
  } else {
    alert('Please enter a question and at least 2 options!');
  }
};
</script>

<template>
  <div class="container mx-auto max-w-2xl pt-20 px-4">
    <NeoCard title="Create New Poll" v-motion-slide-bottom>
      <div class="flex flex-col gap-6">
        <NeoInput v-model="question" label="Question" placeholder="What do you want to ask?" />

        <div class="flex flex-col gap-4">
          <label class="font-bold text-lg uppercase">Options</label>
          <div
            v-for="(option, index) in options"
            :key="index"
            class="flex items-center gap-2"
            v-motion-slide-right
            :delay="index * 100"
          >
            <div class="flex-grow">
              <NeoInput
                :model-value="options[index] as string"
                @update:model-value="options[index] = $event"
                :placeholder="`Option ${index + 1}`"
              />
            </div>
            <NeoButton v-if="options.length > 2" variant="danger" @click="removeOption(index)" class="mb-0 mr-0">
              X
            </NeoButton>
          </div>

          <div class="flex gap-4">
            <NeoButton variant="secondary" @click="addOption" class="self-start">
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
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add Option</span>
              </div>
            </NeoButton>
            <NeoFileUpload @upload="handleFileUpload" />
            <button
              class="flex items-center justify-center w-12 h-12 rounded-full border-3 border-neo-black bg-sky-200 text-neo-black hover:bg-sky-400 font-bold shadow-neo active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
              @click="showHelp = true"
              title="Upload Help"
            >
              ?
            </button>
          </div>
        </div>

        <div class="border-t-3 border-neo-black my-2"></div>

        <NeoButton block variant="primary" @click="handleCreate" class="text-xl py-4"> CREATE POLL </NeoButton>
      </div>
    </NeoCard>

    <NeoDialog v-model="showHelp" title="Upload Options Format">
      <div class="space-y-4">
        <p>You can upload a text file (.txt or .csv) to automatically populate the poll options.</p>
        <p class="font-bold">Supported format:</p>
        <code class="block bg-gray-100 p-3 border-2 border-neo-black rounded-lg"> Option 1, Option 2, Option 3 </code>
        <p>Values should be separated by commas.</p>
      </div>
    </NeoDialog>
  </div>
</template>
