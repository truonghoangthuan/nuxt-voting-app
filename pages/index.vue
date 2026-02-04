<script setup lang="ts">
const question = ref('');
const options = ref(['', '']);
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

          <NeoButton variant="secondary" @click="addOption" class="self-start"> + Add Option </NeoButton>
        </div>

        <div class="border-t-3 border-neo-black my-2"></div>

        <NeoButton block variant="primary" @click="handleCreate" class="text-xl py-4"> CREATE POLL </NeoButton>
      </div>
    </NeoCard>
  </div>
</template>
