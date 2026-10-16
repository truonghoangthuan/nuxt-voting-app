<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { usePolls } from '~/composables/usePolls';
import type { Poll } from '~/server/utils/storage';
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useUserVotes } from '~/composables/useUserVotes';
import { reconcileVotes, buildVoteActivity, type PollActivity } from '~/utils/reconcile';

const route = useRoute();
const router = useRouter();
const { getPoll, vote, addOption, subscribe } = usePolls();
const { hasVotedForOption, getVotedOptions } = useUserVotes();
const { userName } = useUser();
const { user } = useAuth();
const pollId = route.params.id as string;

const poll = ref<Poll | null>(null);

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
const userVotedOptions = computed(() => (poll.value ? getVotedOptions(poll.value) : []));
const remainingVotes = computed(() => Math.max(0, maxVotes.value - userVotedOptions.value.length));

const pollRef = await getPoll(pollId);
if (pollRef.value) {
  poll.value = pollRef.value;
}

const handleOptionClick = async (optionId: string) => {
  if (isPollClosed.value || !poll.value) return;

  const currentVoted = [...userVotedOptions.value];
  let nextOptionIds: string[];

  if (currentVoted.includes(optionId)) {
    nextOptionIds = currentVoted.filter((id) => id !== optionId);
  } else if (maxVotes.value === 1) {
    nextOptionIds = [optionId];
  } else if (currentVoted.length < maxVotes.value) {
    nextOptionIds = [...currentVoted, optionId];
  } else {
    const { addToast } = useToast();
    addToast(`You can select up to ${maxVotes.value} options`, 'error');
    return;
  }

  const previousOptions = JSON.parse(JSON.stringify(poll.value.options));
  const previousActivities = JSON.parse(JSON.stringify(poll.value.activities || []));
  const userId = user.value?.uid;
  const actorName = userName.value || 'Guest';

  const activity = buildVoteActivity(poll.value.options, nextOptionIds, userId, actorName);
  poll.value.options = reconcileVotes(poll.value.options, nextOptionIds, userId, actorName);
  if (activity) {
    poll.value.activities = [activity, ...(poll.value.activities || [])].slice(0, 30);
  }
  if (userId) {
    if (!poll.value.participants) poll.value.participants = [];
    if (nextOptionIds.length > 0 && !poll.value.participants.includes(userId)) {
      poll.value.participants.push(userId);
    } else if (nextOptionIds.length === 0) {
      poll.value.participants = poll.value.participants.filter((id) => id !== userId);
    }
  }

  try {
    await vote(pollId, nextOptionIds, actorName, userId);
  } catch (e) {
    if (poll.value) {
      poll.value.options = previousOptions;
      poll.value.activities = previousActivities;
    }
    const { addToast } = useToast();
    addToast('Failed to update vote', 'error');
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
  const trimmed = newOptionText.value.trim();
  if (!trimmed) return;
  isAddingOption.value = true;
  try {
    await addOption(pollId, trimmed, userName.value || 'Guest', user.value?.uid);
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

const formatActivityMessage = (activity: PollActivity): string => {
  switch (activity.type) {
    case 'add_option':
      return `${activity.actorName} added option "${activity.optionTexts.join(', ')}"`;
    case 'vote':
      return `${activity.actorName} voted for "${activity.optionTexts.join(', ')}"`;
    case 'change_vote':
      return `${activity.actorName} changed vote from "${activity.previousOptionTexts?.join(', ') || ''}" to "${activity.optionTexts.join(', ')}"`;
    case 'unvote':
      return `${activity.actorName} removed vote from "${activity.previousOptionTexts?.join(', ') || ''}"`;
    default:
      return `${activity.actorName} updated poll`;
  }
};

const formatActivityTime = (timestamp: number): string => {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(timestamp).toLocaleDateString();
};

let unsubscribe: (() => void) | undefined;

onMounted(() => {
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

    <AppCard v-else :title="isPollClosed ? 'Results (Closed)' : 'Live Poll'" show-share>
      <div class="flex justify-between items-start mb-8 gap-4">
        <h2 class="text-2xl font-bold leading-relaxed tracking-tight text-claude-text">{{ poll.question }}</h2>
        <AppButton v-if="isCreator && !isPollClosed" variant="danger" size="sm" @click="handleClosePoll" :loading="isClosing">Close Poll</AppButton>
      </div>

      <div
        v-if="!isPollClosed"
        class="mb-6 bg-claude-bg border border-claude-border p-4 text-claude-text font-medium text-sm flex items-center gap-2 rounded-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
        <span v-if="maxVotes > 1">
          Click any option to vote or change your vote in real time — up to {{ maxVotes }} options ({{ remainingVotes }} remaining)
        </span>
        <span v-else>
          Click any option to vote or switch your vote in real time. Click again to unvote.
        </span>
      </div>

      <!-- Unified Interactive Options List -->
      <div class="flex flex-col gap-3">
        <button
          v-for="option in poll.options"
          :key="option.id"
          type="button"
          @click="handleOptionClick(option.id)"
          :disabled="isPollClosed"
          class="relative w-full p-4 border text-left font-medium transition-all duration-200 group rounded-xl overflow-hidden cursor-pointer disabled:cursor-not-allowed"
          :class="[
            isOptionVoted(option.id)
              ? 'border-claude-text bg-claude-bg shadow-sm'
              : 'border-claude-border bg-claude-card hover:bg-claude-bg',
          ]"
        >
          <!-- Animated Progress Bar Background -->
          <div
            class="absolute top-0 left-0 bottom-0 bg-claude-hover/70 transition-all duration-700 ease-out pointer-events-none"
            :style="{ width: `${getPercentage(option.votes)}%` }"
          ></div>

          <div class="relative z-10 flex items-start gap-3.5">
            <!-- Radio / Checkbox Indicator -->
            <div 
              class="w-5 h-5 flex-shrink-0 border flex items-center justify-center transition-colors mt-0.5"
              :class="[
                maxVotes > 1 ? 'rounded-sm' : 'rounded-full',
                isOptionVoted(option.id) ? 'border-claude-text bg-claude-text' : 'border-gray-300 bg-claude-card'
              ]"
            >
              <svg v-if="isOptionVoted(option.id)" class="w-3 h-3 text-claude-bg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div class="flex-grow flex flex-col gap-1">
              <div class="flex justify-between items-center gap-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-lg text-claude-text">{{ option.text }}</span>
                  <span v-if="option.addedBy" class="text-xs text-claude-muted font-mono">
                    Added by {{ option.addedBy }}
                  </span>
                </div>
                <div class="flex items-center gap-2 font-mono text-sm shrink-0">
                  <span class="text-claude-text font-medium">{{ getPercentage(option.votes) }}% ({{ option.votes }})</span>
                  <span
                    v-if="isOptionVoted(option.id)"
                    class="text-xs bg-claude-text text-claude-bg px-2 py-0.5 font-bold rounded"
                  >YOU</span>
                </div>
              </div>

              <!-- Inline Voter Chips -->
              <div v-if="option.voters && option.voters.length > 0" class="relative z-10 mt-3 pt-3 border-t border-claude-border/60 flex flex-wrap items-center gap-1.5">
                <span class="text-xs uppercase tracking-wider text-claude-muted font-mono mr-1">Voters:</span>
                <span
                  v-for="voter in option.voters"
                  :key="voter"
                  class="px-2 py-0.5 bg-claude-bg border border-claude-border rounded text-xs font-medium text-claude-text"
                >
                  {{ voter }}
                </span>
              </div>
            </div>
          </div>
        </button>
      </div>

      <!-- Add Option Inline Bar -->
      <div v-if="!isPollClosed" class="mt-6 border-t border-claude-border pt-6">
        <div v-if="!showAddOption">
          <button @click="showAddOption = true" class="text-claude-text font-medium underline hover:text-gray-600 transition-colors">
            + Add an Option
          </button>
        </div>
        <div v-else class="flex flex-grow gap-2">
          <AppInput v-model="newOptionText" placeholder="New option text" class="flex-grow" @keyup.enter="handleAddOption" />
          <AppButton variant="primary" @click="handleAddOption" :loading="isAddingOption">Add</AppButton>
          <AppButton variant="secondary" @click="showAddOption = false">Cancel</AppButton>
        </div>
      </div>

      <!-- Live Activity Section -->
      <div v-if="poll.activities && poll.activities.length > 0" class="mt-10 border-t border-claude-border pt-8">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h3 class="text-sm font-semibold uppercase tracking-wider text-claude-text font-mono">Live Activity</h3>
          </div>
          <span class="text-xs text-claude-muted font-mono">{{ poll.activities.length }} events</span>
        </div>

        <div class="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
          <div
            v-for="act in poll.activities"
            :key="act.id"
            class="flex items-start justify-between gap-3 p-3 rounded-lg bg-claude-bg border border-claude-border/80 text-xs font-mono"
          >
            <div class="flex items-center gap-2 flex-wrap">
              <span
                class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider"
                :class="{
                  'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300': act.type === 'vote',
                  'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300': act.type === 'change_vote',
                  'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300': act.type === 'add_option',
                  'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300': act.type === 'unvote',
                }"
              >
                {{ act.type.replace('_', ' ') }}
              </span>
              <span class="text-claude-text">{{ formatActivityMessage(act) }}</span>
            </div>
            <span class="text-claude-muted shrink-0">{{ formatActivityTime(act.createdAt) }}</span>
          </div>
        </div>
      </div>

      <div class="mt-8 border-t border-claude-border pt-6">
        <AppButton block variant="secondary" @click="router.push('/')">
          Create Another Poll
        </AppButton>
      </div>
    </AppCard>
  </div>
</template>
