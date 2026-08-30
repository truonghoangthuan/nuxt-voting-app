<script setup lang="ts">
const question = ref('');
const options = ref(['', '']);
const maxVotes = ref(1);
const showHelp = ref(false);
const { createPoll } = usePolls();
const router = useRouter();

const addOption = () => {
  options.value = [...options.value, ''];
};

const removeOption = (index: number) => {
  if (options.value.length > 2) {
    options.value = options.value.filter((_, i) => i !== index);
  }
};

const handleFileUpload = (content: string) => {
  const fileOptions = content
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o);

  if (fileOptions.length === 0) return;

  const hasExistingContent = options.value.some((o) => o.trim() !== '');
  let newOptions = hasExistingContent ? [...options.value, ...fileOptions] : [...fileOptions];

  // Ensure minimum 2 options
  while (newOptions.length < 2) {
    newOptions = [...newOptions, ''];
  }

  options.value = newOptions;
};

const deadlineHours = ref<number | null>(null);
const { user } = useAuth();

const handleCreate = async () => {
  const validOptions = options.value.filter((o) => o.trim());
  if (question.value.trim() && validOptions.length >= 2) {
    let deadlineTimestamp = null;
    if (deadlineHours.value && deadlineHours.value > 0) {
      deadlineTimestamp = Date.now() + deadlineHours.value * 3600 * 1000;
    }
    
    const creatorId = user.value?.uid || null;

    const id = await createPoll(question.value, validOptions, parseInt(maxVotes.value.toString(), 10), creatorId, deadlineTimestamp);
    if (id) {
      router.push(`/vote/${id}`);
    }
  } else {
    const { addToast } = useToast();
    addToast('Please enter a question and at least 2 options!', 'error');
  }
};

watch(
  options,
  () => {
    if (maxVotes.value > options.value.length) {
      maxVotes.value = options.value.length;
    }
  },
  { deep: true },
);

watch(maxVotes, () => {
  if (maxVotes.value > options.value.length) {
    maxVotes.value = options.value.length;
  }
});
</script>

<template>
  <div class="container mx-auto max-w-2xl pt-24 px-6 pb-20">
    <div class="mb-12">
      <NeoButton variant="secondary" @click="router.push('/')"> ← Back to Home </NeoButton>
    </div>

    <NeoCard title="Create New Poll">
      <div class="flex flex-col gap-8">
        <NeoInput v-model="question" label="Question" placeholder="What do you want to ask?" />

        <div class="flex flex-col gap-1.5">
          <label class="font-medium text-sm text-gray-700">Max Votes per User</label>
          <NeoInput
            v-model="maxVotes"
            type="number"
            min="1"
            :max="options.length"
            placeholder="1"
            class="w-32"
            @keydown="(e: KeyboardEvent) => ['-', 'e', '+'].includes(e.key) && e.preventDefault()"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label class="font-medium text-sm text-gray-700">Deadline (in hours from now) - Optional</label>
          <NeoInput
            v-model="deadlineHours"
            type="number"
            min="1"
            placeholder="e.g. 24"
            class="w-32"
          />
        </div>

        <div class="flex flex-col gap-4">
          <label class="font-medium text-sm text-gray-700">Options</label>
          <div
            v-for="(option, index) in options"
            :key="index"
            class="flex items-center gap-2"
          >
            <div class="flex-grow">
              <NeoInput
                :model-value="options[index] as string"
                @update:model-value="options[index] = $event as string"
                :placeholder="`Option ${index + 1}`"
              />
            </div>
            <NeoButton v-if="options.length > 2" variant="secondary" @click="removeOption(index)" class="mb-0 mr-0">
              ✕
            </NeoButton>
          </div>

          <div class="flex gap-4 mt-2">
            <NeoButton variant="secondary" @click="addOption" class="self-start">
              <div class="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                <span>Add Option</span>
              </div>
            </NeoButton>
            <NeoFileUpload @upload="handleFileUpload" />
            <button
              class="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 font-medium transition-colors"
              @click="showHelp = true"
              title="Upload Help"
              aria-label="Upload Help"
            >
              ?
            </button>
          </div>
        </div>

        <div class="border-t border-gray-200 my-4"></div>

        <NeoButton block variant="primary" @click="handleCreate" class="text-base py-3"> Create Poll </NeoButton>
      </div>
    </NeoCard>

    <NeoDialog v-model="showHelp" title="Upload Options Format">
      <div class="space-y-4 text-sm text-gray-700 font-normal">
        <p>You can upload a text file (.txt or .csv) to automatically populate the poll options.</p>
        <p class="font-medium text-black">Supported format:</p>
        <code class="block bg-gray-50 p-3 border border-gray-200 font-mono text-black">Option 1, Option 2, Option 3</code>
        <p>Values should be separated by commas.</p>
      </div>
    </NeoDialog>
  </div>
</template>
