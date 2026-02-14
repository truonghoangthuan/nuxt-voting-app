<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const { register, error, loading } = useAuth();
const router = useRouter();
const localError = ref<string | null>(null);

const handleRegister = async () => {
  localError.value = null;
  if (!email.value || !password.value) return;

  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match';
    return;
  }

  try {
    await register(email.value, password.value);
    router.push('/');
  } catch (e) {
    // Error is handled in composable state
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4">
    <NeoCard class="w-full max-w-md p-8">
      <h1 class="text-3xl font-black mb-8 text-center uppercase">Create Account</h1>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <NeoInput v-model="email" label="Email" type="email" placeholder="Enter your email" id="email" required />

        <NeoInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Choose a password"
          id="password"
          required
        />

        <NeoInput
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          id="confirm-password"
          required
        />

        <div v-if="error || localError" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p>{{ error || localError }}</p>
        </div>

        <NeoButton type="submit" variant="secondary" :block="true" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
        </NeoButton>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600">
          Already have an account?
          <NuxtLink to="/login" class="font-bold text-neo-main hover:underline"> Login </NuxtLink>
        </p>
      </div>
    </NeoCard>
  </div>
</template>
