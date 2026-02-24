<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

const email = ref('');
const password = ref('');
const guestUsername = ref('');
const { login, loginAsGuest, error, loading } = useAuth();
const router = useRouter();

const handleLogin = async () => {
  if (!email.value || !password.value) return;

  try {
    await login(email.value, password.value);
    const redirectPath = (useRoute().query.redirect as string) || '/';
    router.push(redirectPath);
  } catch (e) {
    // Error is handled in composable state
  }
};

const handleGuestLogin = async () => {
  if (!guestUsername.value) return;

  try {
    await loginAsGuest(guestUsername.value);
    const redirectPath = (useRoute().query.redirect as string) || '/';
    router.push(redirectPath);
  } catch (e) {
    // Error is handled in composable state
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <NeoCard class="w-full max-w-md p-8">
      <h1 class="text-3xl font-black mb-8 text-center uppercase">Login</h1>

      <form @submit.prevent="handleLogin" class="space-y-6">
        <NeoInput v-model="email" label="Email" type="email" placeholder="Enter your email" id="email" required />

        <NeoInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Enter your password"
          id="password"
          required
        />

        <div v-if="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{{ error }}</p>
        </div>

        <NeoButton type="submit" variant="primary" :block="true" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </NeoButton>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Don't have an account?
          <NuxtLink to="/register" class="font-bold text-neo-main hover:underline"> Create Account </NuxtLink>
        </p>
      </div>

      <div class="relative py-6 flex items-center">
        <div class="flex-grow border-t-2 border-gray-200"></div>
        <span class="flex-shrink-0 mx-4 text-gray-400 font-bold uppercase tracking-wider text-sm">Or</span>
        <div class="flex-grow border-t-2 border-gray-200"></div>
      </div>

      <form @submit.prevent="handleGuestLogin" class="space-y-6">
        <NeoInput
          v-model="guestUsername"
          label="Guest Username"
          type="text"
          placeholder="Enter a username to join"
          id="guestUsername"
          required
        />

        <NeoButton type="submit" variant="secondary" :block="true" :disabled="loading" class="w-full">
          {{ loading ? 'Loggin in...' : 'Continue as Guest' }}
        </NeoButton>
      </form>
    </NeoCard>
  </div>
</template>
