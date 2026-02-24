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
  <div class="fixed top-4 right-4 z-40 flex flex-col items-end gap-2" v-motion-slide-top>
    <div
      class="bg-neo-accent border-3 border-neo-black p-3 shadow-neo transition-all duration-300 hover:scale-105 hover:bg-neo-main group cursor-help max-w-[calc(100vw-2rem)] sm:max-w-[200px]"
    >
      <div class="font-black text-xs uppercase tracking-wider mb-1 group-hover:text-neo-white">Welcome,</div>
      <div class="font-black text-lg truncate group-hover:text-neo-white font-mono" :title="user?.email || displayName">
        {{ displayName }}
      </div>

      <!-- Decorative elements -->
      <div
        class="absolute -top-2 -right-2 w-4 h-4 bg-neo-main border-2 border-neo-black rounded-full hidden group-hover:block animate-bounce"
      ></div>
      <div
        class="absolute -bottom-2 -left-2 w-3 h-3 bg-neo-white border-2 border-neo-black rotate-45 hidden group-hover:block animate-spin"
      ></div>
    </div>

    <div class="flex gap-2">
      <template v-if="user">
        <NeoButton variant="danger" size="sm" @click="handleLogout">Logout</NeoButton>
      </template>
      <template v-else>
        <NuxtLink to="/login">
          <NeoButton variant="black" size="sm">Login</NeoButton>
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
