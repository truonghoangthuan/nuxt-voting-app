<script setup lang="ts">
import './assets/css/main.css';
import { useAuth } from '~/composables/useAuth';
import { Analytics } from '@vercel/analytics/nuxt';

useHead({
  link: [
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap'
    }
  ]
})

const { user } = useAuth();
const route = useRoute();
const router = useRouter();

// Watch for auth state changes to redirect from public pages if logged in
watch(user, (newUser) => {
  if (newUser && ['/login', '/register'].includes(route.path)) {
    const redirectPath = (route.query.redirect as string) || '/';
    router.push(redirectPath);
  }
});
</script>

<template>
  <div class="min-h-screen bg-swiss-bg text-swiss-text font-sans selection:bg-black selection:text-white">
    <WelcomeBanner />
    <NuxtPage />
    <Analytics />
  </div>
</template>
