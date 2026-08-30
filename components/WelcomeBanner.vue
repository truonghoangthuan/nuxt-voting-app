<script setup lang="ts">
import { useAuth } from '../composables/useAuth';

const { user, logout } = useAuth();
const router = useRouter();

const displayName = computed(() => {
  if (user.value?.displayName) {
    return user.value.displayName;
  }
  if (user.value?.email) {
    return user.value.email.split('@')[0];
  }
  return 'Guest';
});

const handleLogout = async () => {
  await logout();
  router.push('/login');
};
</script>

<template>
  <div class="fixed top-4 right-4 z-40 flex flex-col items-end gap-2">
    <div
      class="bg-white border border-gray-200 px-4 py-2 hover:bg-gray-50 transition-colors cursor-help max-w-[calc(100vw-2rem)] sm:max-w-[200px] flex items-center justify-between gap-3 shadow-sm rounded-sm"
    >
      <div class="text-xs text-gray-500 uppercase tracking-wider font-medium">User</div>
      <div class="text-sm font-medium truncate font-mono text-black" :title="user?.email || displayName">
        {{ displayName }}
      </div>
    </div>

    <div class="flex gap-2">
      <template v-if="user">
        <NuxtLink to="/history">
          <NeoButton variant="black" size="sm">History</NeoButton>
        </NuxtLink>
        <NeoButton variant="white" size="sm" @click="handleLogout">Logout</NeoButton>
      </template>
      <template v-else>
        <NuxtLink to="/login">
          <NeoButton variant="black" size="sm">Login</NeoButton>
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
