<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';
import { usePolls } from '~/composables/usePolls';
import type { Poll } from '~/server/utils/storage';

const { user, loading: authLoading } = useAuth();
const { getJoinedPolls } = usePolls();
const router = useRouter();

const joinedPolls = ref<Poll[]>([]);
const loading = ref(true);
const isCreating = ref(false);

onMounted(async () => {
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

const goToCreate = async () => {
  isCreating.value = true;
  await router.push('/create');
  isCreating.value = false;
};
</script>

<template>
  <div class="container mx-auto max-w-4xl pt-24 px-6 pb-20">
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-swiss-border pb-6">
      <h1 class="text-2xl font-medium tracking-tight text-swiss-black">My Joined Polls</h1>
      <AppButton variant="primary" @click="goToCreate" :loading="isCreating" class="mt-4 md:mt-0"> Create New Poll </AppButton>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-24">
      <AppLoader />
    </div>

    <!-- Empty State -->
    <div v-else-if="joinedPolls.length === 0">
      <div class="text-center py-24 border border-dashed border-swiss-border rounded-none">
        <h2 class="text-lg font-medium mb-2 text-swiss-black">No polls joined yet</h2>
        <p class="text-swiss-muted mb-8 max-w-md mx-auto text-sm">
          You haven't participated in any polls yet. Why not create one or join existing ones?
        </p>
        <AppButton variant="secondary" @click="goToCreate" :loading="isCreating"> Create Your First Poll </AppButton>
      </div>
    </div>

    <!-- Polls Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-swiss-border border border-swiss-border">
      <div
        v-for="(poll, index) in joinedPolls"
        :key="poll.id"
        class="bg-swiss-card hover:bg-swiss-hover transition-all duration-200 hover:-translate-y-1 hover:shadow-sm hover:z-10 cursor-pointer p-8 flex flex-col relative group"
        @click="goToPoll(poll.id)"
      >
        <div class="flex justify-between items-start mb-12">
          <h3 class="text-base font-normal line-clamp-3 leading-relaxed text-swiss-black">
            {{ poll.question }}
          </h3>
          <!-- Active Poll Indicator using an accent color -->
          <div class="w-2 h-2 rounded-full bg-swiss-green mt-1.5 flex-shrink-0" title="Active"></div>
        </div>

        <div class="mt-auto flex justify-between items-center text-xs font-mono text-swiss-muted">
          <span>{{ poll.options.length < 10 ? '0' + poll.options.length : poll.options.length }} OPT</span>
          <span class="text-swiss-black">
            {{ poll.options.reduce((acc, curr) => acc + curr.votes, 0) }} VOTES
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
