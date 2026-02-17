<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { usePolls } from '~/composables/usePolls';
import type { Poll } from '~/server/utils/storage';

const { user, loading: authLoading } = useAuth();
const { getJoinedPolls } = usePolls();
const router = useRouter();

const joinedPolls = ref<Poll[]>([]);
const loading = ref(true);

onMounted(async () => {
  // Wait for auth to be ready if it's loading
  if (authLoading.value) {
    const unwatch = watch(authLoading, async (newVal) => {
      if (!newVal) {
        unwatch();
        await fetchPolls();
      }
    });
  } else {
    await fetchPolls();
  }
});

const fetchPolls = async () => {
  if (user.value?.uid) {
    try {
      const polls = await getJoinedPolls(user.value.uid);
      const allPolls = polls.value || [];
      // Sort by createdAt descending (newest first)
      // Use 0 as fallback for legacy polls without createdAt
      joinedPolls.value = allPolls.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    } catch (e) {
      console.error('Failed to fetch polls', e);
    } finally {
      loading.value = false;
    }
  } else {
    loading.value = false;
  }
};

const goToPoll = (id: string) => {
  router.push(`/vote/${id}`);
};

const goToCreate = () => {
  router.push('/create');
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<template>
  <div class="container mx-auto max-w-4xl pt-20 px-4 pb-12">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h1 class="text-4xl font-black uppercase tracking-tight">My Joined Polls</h1>
      <NeoButton variant="primary" @click="goToCreate" icon="plus"> Create New Poll </NeoButton>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-neo-black"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="joinedPolls.length === 0" v-motion-fade>
      <NeoCard class="text-center py-16">
        <div class="text-6xl mb-6">🗳️</div>
        <h2 class="text-2xl font-bold mb-2">No polls joined yet</h2>
        <p class="text-gray-600 mb-8 max-w-md mx-auto">
          You haven't participated in any polls yet. Why not create one or join existing ones?
        </p>
        <NeoButton variant="secondary" @click="goToCreate"> Create Your First Poll </NeoButton>
      </NeoCard>
    </div>

    <!-- Polls Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="(poll, index) in joinedPolls"
        :key="poll.id"
        v-motion-slide-visible-bottom
        :delay="index * 100"
        class="h-full"
      >
        <div
          class="h-full flex flex-col bg-white border-3 border-neo-black shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer p-6 relative group"
          @click="goToPoll(poll.id)"
        >
          <div class="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </div>

          <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-bold line-clamp-2 leading-tight flex-grow pr-2">
              {{ poll.question }}
            </h3>
          </div>

          <div v-if="poll.createdAt" class="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">
            Created: {{ formatDate(poll.createdAt) }}
          </div>
          <div v-else class="mb-4"></div>
          <!-- Spacer for missing date -->

          <div
            class="mt-auto pt-4 border-t-2 border-gray-100 flex justify-between items-center text-sm font-bold text-gray-500"
          >
            <span>{{ poll.options.length }} Options</span>
            <span class="bg-neo-bg px-2 py-1 border border-neo-black text-neo-black text-xs">
              {{ poll.options.reduce((acc, curr) => acc + curr.votes, 0) }} Votes
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
