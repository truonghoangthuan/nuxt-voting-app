<script setup lang="ts">
import './assets/css/main.css';
import { useAuth } from '~/composables/useAuth';

const { user } = useAuth();
const route = useRoute();
const router = useRouter();

// Watch for auth state changes to redirect from public pages if logged in
watch(user, (newUser) => {
  if (newUser && ['/login', '/register'].includes(route.path)) {
    router.push('/');
  }
});
</script>

<template>
  <div class="min-h-screen bg-neo-bg text-neo-text font-sans selection:bg-neo-main selection:text-black">
    <WelcomeBanner />
    <NuxtPage />
  </div>
</template>
