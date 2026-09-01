<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { usePolls } from '../../composables/usePolls';
import type { Poll } from '~/server/utils/storage';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useUserVotes } from '~/composables/useUserVotes';

const route = useRoute();
const router = useRouter();
const { getPoll, vote, subscribe } = usePolls();
const { getVoteCount, hasVotedForOption } = useUserVotes();
const { userName } = useUser();
const pollId = route.params.id as string;

const poll = ref<Poll | null>(null);
const selectedOptions = ref<string[]>([]);
const userVoteCount = ref(0);
const expandedOptionId = ref<string | null>(null);

const { user } = useAuth();
const isCreator = computed(() => {
  return poll.value?.creatorId && user.value?.uid && poll.value.creatorId === user.value.uid;
});
const isPollClosed = computed(() => {
  if (!poll.value) return false;
  if (poll.value.status === 'closed') return true;
  if (poll.value.deadline && Date.now() > poll.value.deadline) return true;
  return false;
});

const maxVotes = computed(() => poll.value?.maxVotes || 1);
const remainingVotes = computed(() => maxVotes.value - userVoteCount.value);
const canVote = computed(() => {
  return !isPollClosed.value && selectedOptions.value.length > 0 && selectedOptions.value.length <= remainingVotes.value;
});
const isMaxVotesReached = computed(() => userVoteCount.value >= maxVotes.value);

const pollRef = await getPoll(pollId);
if (pollRef.value) {
  poll.value = pollRef.value;
  if (poll.value) {
    userVoteCount.value = getVoteCount(poll.value);
  }
}

const toggleOption = (optionId: string) => {
  if (isOptionVoted(optionId)) return;

  if (selectedOptions.value.includes(optionId)) {
    selectedOptions.value = selectedOptions.value.filter((id) => id !== optionId);
  } else {
    if (selectedOptions.value.length < remainingVotes.value) {
      selectedOptions.value.push(optionId);
    }
  }
};

const handleVote = async () => {
  if (selectedOptions.value.length > 0 && canVote.value) {
    const currentOptionIds = [...selectedOptions.value];

    // Optimistic update: Update local poll state immediately
    const userId = user.value?.uid;
    if (poll.value && userId) {
      currentOptionIds.forEach((optionId) => {
        const option = poll.value!.options.find((o) => o.id === optionId);
        if (option) {
          option.votes = (option.votes || 0) + 1;
          if (!option.voterIds) option.voterIds = [];
          option.voterIds.push(userId);

          // Also add to voters list for display if needed
          if (userName.value) {
            if (!option.voters) option.voters = [];
            option.voters.push(userName.value);
          }
        }
      });

      // Update participants list
      if (!poll.value.participants) poll.value.participants = [];
      if (!poll.value.participants.includes(userId)) {
        poll.value.participants.push(userId);
      }
    }

    // Update simple counter
    userVoteCount.value += currentOptionIds.length;

    await vote(pollId, currentOptionIds, userName.value, userId);

    // Reset selection
    selectedOptions.value = [];
  }
};

const isClosing = ref(false);
const handleClosePoll = async () => {
  if (confirm('Are you sure you want to close this poll? No more votes can be cast.')) {
    isClosing.value = true;
    try {
      await useFetch(`/api/polls/${pollId}/close`, {
        method: 'POST',
        body: { userId: user.value?.uid },
      });
      // The SSE will update the poll state, but we can optimistically update
      if (poll.value) poll.value.status = 'closed';
      const { addToast } = useToast();
      addToast('Poll closed successfully', 'success');
    } catch (e) {
      const { addToast } = useToast();
      addToast('Failed to close poll', 'error');
    } finally {
      isClosing.value = false;
    }
  }
};

const newOptionText = ref('');
const isAddingOption = ref(false);
const showAddOption = ref(false);
const handleAddOption = async () => {
  if (!newOptionText.value.trim()) return;
  isAddingOption.value = true;
  try {
    await useFetch(`/api/polls/${pollId}/options`, {
      method: 'POST',
      body: { optionText: newOptionText.value.trim() },
    });
    newOptionText.value = '';
    showAddOption.value = false;
    const { addToast } = useToast();
    addToast('Option added successfully', 'success');
  } catch (e) {
    const { addToast } = useToast();
    addToast('Failed to add option', 'error');
  } finally {
    isAddingOption.value = false;
  }
};

const isOptionVoted = (optionId: string) => {
  if (!poll.value) return false;
  return hasVotedForOption(poll.value, optionId);
};

let unsubscribe: (() => void) | undefined;

onMounted(() => {
  // Subscribe to real-time updates
  unsubscribe = subscribe(pollId, (updatedPoll) => {
    poll.value = updatedPoll;
    // Update local user vote count from fresh data if needed, or rely on local state
    if (poll.value) {
      // We might want to re-calc userVoteCount here to be safe, but useUserVotes depends on poll value
      userVoteCount.value = getVoteCount(poll.value);
    }
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
  <div class="container mx-auto max-w-2xl pt-24 px-6 pb-20">
    <div class="mb-12">
      <AppButton variant="secondary" @click="router.push('/')"> ← Back to Home </AppButton>
    </div>

    <div v-if="!poll" class="text-center">
      <AppCard title="404">
        <p class="text-lg text-claude-muted mb-6">Poll not found</p>
        <AppButton @click="router.push('/')">Go Home</AppButton>
      </AppCard>
    </div>

    <AppCard v-else :title="isPollClosed ? 'Results (Closed)' : (isMaxVotesReached ? 'Results' : 'Vote Now')" show-share>
      <div class="flex justify-between items-start mb-8 gap-4">
        <h2 class="text-2xl font-bold leading-relaxed tracking-tight text-claude-text">{{ poll.question }}</h2>
        <AppButton v-if="isCreator && !isPollClosed" variant="danger" size="sm" @click="handleClosePoll" :loading="isClosing">Close Poll</AppButton>
      </div>

      <div
        v-if="maxVotes > 1 && !isPollClosed"
        class="mb-8 bg-claude-bg border border-claude-border p-4 text-claude-text font-medium text-sm flex items-center gap-2 rounded-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        You have {{ remainingVotes }} votes remaining (Total: {{ maxVotes }})
      </div>
      <div v-else class="mb-8"></div>

      <div v-if="!isMaxVotesReached && !isPollClosed" class="flex flex-col gap-3">
        <button
          v-for="(option, index) in poll.options"
          :key="option.id"
          @click="toggleOption(option.id)"
          :disabled="isOptionVoted(option.id)"
          class="relative w-full p-4 border text-left font-medium text-lg transition-colors duration-200 group flex items-center gap-4 rounded-xl mb-3"
          :class="[
            selectedOptions.includes(option.id)
              ? 'border-claude-text bg-claude-bg'
              : 'border-claude-border bg-claude-card hover:bg-claude-bg',
            isOptionVoted(option.id) ? 'opacity-50 cursor-not-allowed bg-claude-hover hover:bg-claude-hover' : '',
          ]"
        >
          <!-- Radio / Checkbox Indicator -->
          <div 
            class="w-5 h-5 flex-shrink-0 border flex items-center justify-center transition-colors"
            :class="[
              maxVotes > 1 ? 'rounded-sm' : 'rounded-full',
              selectedOptions.includes(option.id) ? 'border-claude-text bg-claude-text' : 'border-gray-300'
            ]"
          >
            <svg v-if="selectedOptions.includes(option.id)" class="w-3 h-3 text-claude-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div class="flex-grow flex justify-between items-center text-claude-text">
            <span>{{ option.text }}</span>
            <span v-if="isOptionVoted(option.id)" class="text-xs bg-claude-hover px-2 py-1 border border-claude-border text-claude-muted font-mono tracking-wider">VOTED</span>
          </div>
        </button>

        <div class="mt-8 flex justify-between items-center gap-4 border-t border-claude-border pt-8">
          <div v-if="!showAddOption">
            <button @click="showAddOption = true" class="text-claude-text font-medium underline hover:text-gray-600 transition-colors">
              + Add an Option
            </button>
          </div>
          <div v-else class="flex flex-grow gap-2">
            <AppInput v-model="newOptionText" placeholder="New option text" class="flex-grow" />
            <AppButton variant="primary" @click="handleAddOption" :loading="isAddingOption">Add</AppButton>
            <AppButton variant="secondary" @click="showAddOption = false">Cancel</AppButton>
          </div>

          <AppButton
            v-if="selectedOptions.length > 0"
            variant="black"
            @click="handleVote"
            class="text-base px-8 ml-auto"
            :disabled="!canVote"
          >
            Submit Vote ({{ selectedOptions.length }})
          </AppButton>
        </div>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div
          v-for="(option, index) in poll.options"
          :key="option.id"
          class="relative w-full border border-claude-border bg-claude-card cursor-pointer transition-colors hover:bg-claude-bg overflow-hidden rounded-xl mb-3"
          @click="expandedOptionId = expandedOptionId === option.id ? null : option.id"
        >
          <div class="p-5 relative z-10">
            <!-- Progress Bar Background -->
            <div
              class="absolute top-0 left-0 bottom-0 bg-claude-hover transition-all duration-1000 ease-out"
              :style="{ width: `${getPercentage(option.votes)}%` }"
            ></div>
            
            <div class="relative z-10 flex flex-col sm:flex-row justify-between gap-2 sm:items-center">
              <span class="font-medium text-lg text-claude-text">{{ option.text }}</span>
              <div class="flex items-center gap-4 text-sm font-mono">
                <span class="text-claude-text">{{ getPercentage(option.votes) }}% ({{ option.votes }})</span>
                <span
                  v-if="isOptionVoted(option.id)"
                  class="text-xs bg-claude-text text-claude-bg px-2 py-1"
                >YOU</span>
                <svg
                  class="w-4 h-4 text-claude-muted transition-transform duration-200"
                  :class="{ 'rotate-180': expandedOptionId === option.id }"
                  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <!-- Voter List -->
          <div v-if="expandedOptionId === option.id" class="border-t border-claude-border bg-claude-card p-5">
            <p class="font-medium mb-3 text-xs uppercase tracking-wider text-claude-muted font-mono">Voters</p>
            <div v-if="option.voters && option.voters.length > 0" class="flex flex-wrap gap-2">
              <span
                v-for="voter in option.voters"
                :key="voter"
                class="px-2.5 py-1 bg-claude-bg border border-claude-border text-sm font-medium text-gray-700"
              >
                {{ voter }}
              </span>
            </div>
            <p v-else class="text-claude-muted text-sm">No voters yet.</p>
          </div>
        </div>

        <AppButton block variant="secondary" @click="router.push('/')" class="mt-8"> Create Another Poll </AppButton>
      </div>
    </AppCard>
  </div>
</template>
