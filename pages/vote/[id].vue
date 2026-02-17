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
const { userName } = useUser();
const pollId = route.params.id as string;

const poll = ref<Poll | null>(null);
const selectedOption = ref<string | null>(null);
const hasVoted = ref(false);
const expandedOptionId = ref<string | null>(null);

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
    const { user } = useAuth();
    await vote(pollId, selectedOption.value, userName.value, user.value?.uid);
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

    <NeoCard v-else :title="hasVoted ? 'Results' : 'Vote Now'" v-motion-slide-bottom show-share>
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
          class="relative w-full border-3 border-neo-black bg-neo-white cursor-pointer transition-all hover:translate-x-1"
          @click="expandedOptionId = expandedOptionId === option.id ? null : option.id"
          v-motion-slide-left
          :delay="index * 100"
        >
          <div class="p-4 relative z-10">
            <div
              class="absolute top-0 left-0 bottom-0 bg-neo-accent transition-all duration-1000 ease-out border-r-3 border-neo-black"
              :style="{ width: `${getPercentage(option.votes)}%` }"
            ></div>
            <div class="relative z-10 flex justify-between font-bold text-xl items-center">
              <span>{{ option.text }}</span>
              <div class="flex items-center gap-2">
                <span>{{ getPercentage(option.votes) }}% ({{ option.votes }})</span>
                <span
                  class="text-sm transition-transform duration-200"
                  :class="{ 'rotate-180': expandedOptionId === option.id }"
                >
                  ▼
                </span>
              </div>
            </div>
          </div>

          <!-- Voter List -->
          <div v-if="expandedOptionId === option.id" class="border-t-3 border-neo-black bg-white p-4 animate-fade-in">
            <p class="font-bold mb-2 text-sm uppercase text-gray-500">Voters:</p>
            <div v-if="option.voters && option.voters.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="voter in option.voters"
                :key="voter"
                class="px-2 py-1 bg-neo-bg border-2 border-neo-black text-sm font-bold shadow-neo-sm transform hover:-translate-y-1 transition-transform"
              >
                {{ voter }}
              </span>
            </div>
            <p v-else class="text-gray-400 italic text-sm">No one yet...</p>
          </div>
        </div>

        <NeoButton block variant="secondary" @click="router.push('/')" class="mt-4"> Create Another Poll </NeoButton>
      </div>
    </NeoCard>
  </div>
</template>
