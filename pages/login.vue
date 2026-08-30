<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

const email = ref('');
const password = ref('');
const { login, loginAsGuest, error, loading } = useAuth();
const router = useRouter();

const showGuestDialog = ref(false);
const guestNameInput = ref('');

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

const handleGuestLogin = () => {
  showGuestDialog.value = true;
};

const submitGuestLogin = async () => {
  if (!guestNameInput.value.trim()) return;

  try {
    showGuestDialog.value = false;
    await loginAsGuest(guestNameInput.value.trim());
    const redirectPath = (useRoute().query.redirect as string) || '/';
    router.push(redirectPath);
  } catch (e) {
    // Error is handled in composable state
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <NeoCard class="w-full max-w-md p-10">
      <h1 class="text-2xl font-medium mb-8 text-center tracking-tight text-black">Login</h1>

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

        <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 p-3 text-sm rounded-sm" role="alert">
          <p>{{ error }}</p>
        </div>

        <NeoButton type="submit" variant="primary" :block="true" :disabled="loading">
          {{ loading ? 'Logging in...' : 'Login' }}
        </NeoButton>
      </form>

      <div class="mt-6 text-center text-sm">
        <p class="text-gray-500">
          Don't have an account?
          <NuxtLink to="/register" class="font-medium text-black hover:underline"> Create Account </NuxtLink>
        </p>
      </div>

      <div class="relative py-8 flex items-center">
        <div class="flex-grow border-t border-gray-200"></div>
        <span class="flex-shrink-0 mx-4 text-gray-400 text-xs font-mono">OR</span>
        <div class="flex-grow border-t border-gray-200"></div>
      </div>

      <NeoButton
        type="button"
        @click="handleGuestLogin"
        variant="secondary"
        :block="true"
        :disabled="loading"
        class="w-full"
      >
        {{ loading ? 'Logging in...' : 'Continue as Guest' }}
      </NeoButton>
    </NeoCard>

    <NeoDialog v-model="showGuestDialog" title="Guest Login">
      <div class="space-y-6">
        <p class="text-sm text-gray-600">Please enter a username to join as a guest.</p>
        <NeoInput v-model="guestNameInput" placeholder="Your name" @keyup.enter="submitGuestLogin" />
        <NeoButton block variant="primary" @click="submitGuestLogin" :disabled="!guestNameInput.trim() || loading">
          Continue
        </NeoButton>
      </div>
    </NeoDialog>
  </div>
</template>
