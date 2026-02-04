<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { usePolls } from '../../composables/usePolls';
import type { Poll } from '~/server/utils/storage';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useUserVotes } from '~/composables/useUserVotes';

const route = useRoute();
const router = useRouter();
const { getPoll, vote, subscribe } = usePolls();
const { hasVoted: checkHasVoted, markVoted, getVotedOption } = useUserVotes();
const pollId = route.params.id as string;

const poll = ref<Poll | null>(null);
const selectedOption = ref<string | null>(null);
const hasVoted = ref(false);

const pollRef = await getPoll(pollId);
if (pollRef.value) {
  poll.value = pollRef.value;

  // Check if user has already voted
  const votedOptionId = getVotedOption(pollId);
  if (votedOptionId) {
    selectedOption.value = votedOptionId;
    hasVoted.value = true;
  }
}

const handleVote = async () => {
  if (selectedOption.value) {
    await vote(pollId, selectedOption.value);
    markVoted(pollId, selectedOption.value);
    hasVoted.value = true;
  }
};

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  // Subscribe to real-time updates
  unsubscribe = subscribe(pollId, (updatedPoll) => {
    poll.value = updatedPoll;
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});

const totalVotes = computed(() => {
  if (!poll.value) return 0;
  return poll.value.options.reduce((acc, curr) => acc + curr.votes, 0);
});

const getPercentage = (votes: number) => {
  if (totalVotes.value === 0) return 0;
  return Math.round((votes / totalVotes.value) * 100);
};
</script>

<template>
  <div class="container mx-auto max-w-2xl pt-20 px-4">
    <div v-if="!poll" class="text-center">
      <NeoCard title="404">
        <p class="text-xl mb-4">Poll not found!</p>
        <NeoButton @click="router.push('/')">Go Home</NeoButton>
      </NeoCard>
    </div>

    <NeoCard v-else :title="hasVoted ? 'Results' : 'Vote Now'" v-motion-slide-bottom>
      <h2 class="text-3xl font-black mb-8 leading-tight">{{ poll.question }}</h2>

      <div v-if="!hasVoted" class="flex flex-col gap-4">
        <button
          v-for="(option, index) in poll.options"
          :key="option.id"
          @click="selectedOption = option.id"
          class="relative w-full p-4 border-3 border-neo-black text-left font-bold text-xl transition-all duration-200 group overflow-hidden"
          :class="
            selectedOption === option.id
              ? 'bg-neo-main shadow-none translate-x-[4px] translate-y-[4px]'
              : 'bg-neo-white shadow-neo hover:-translate-y-1 hover:shadow-neo-lg'
          "
        >
          <div class="relative z-10 flex justify-between items-center">
            <span>{{ option.text }}</span>
            <span v-if="selectedOption === option.id" v-motion-pop> Currently Selected </span>
          </div>
        </button>

        <div class="mt-6 flex justify-end">
          <NeoButton v-if="selectedOption" variant="black" @click="handleVote" v-motion-pop class="text-xl px-12">
            VOTE
          </NeoButton>
        </div>
      </div>

      <div v-else class="flex flex-col gap-6">
        <div
          v-for="(option, index) in poll.options"
          :key="option.id"
          class="relative w-full border-3 border-neo-black bg-neo-white p-4"
          v-motion-slide-left
          :delay="index * 100"
        >
          <div
            class="absolute top-0 left-0 bottom-0 bg-neo-accent transition-all duration-1000 ease-out border-r-3 border-neo-black"
            :style="{ width: `${getPercentage(option.votes)}%` }"
          ></div>
          <div class="relative z-10 flex justify-between font-bold text-xl">
            <span>{{ option.text }}</span>
            <span>{{ getPercentage(option.votes) }}% ({{ option.votes }})</span>
          </div>
        </div>

        <NeoButton block variant="secondary" @click="router.push('/')" class="mt-4"> Create Another Poll </NeoButton>
      </div>
    </NeoCard>
  </div>
</template>
