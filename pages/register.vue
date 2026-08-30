<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const displayName = ref('');
const { register, error, loading } = useAuth();
const router = useRouter();
const localError = ref<string | null>(null);

const handleRegister = async () => {
  localError.value = null;
  if (!email.value || !password.value || !displayName.value) return;

  if (password.value !== confirmPassword.value) {
    localError.value = 'Passwords do not match';
    return;
  }

  try {
    await register(email.value, password.value, displayName.value);
    router.push('/');
  } catch (e) {
    // Error is handled in composable state
  }
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <NeoCard class="w-full max-w-md p-10">
      <h1 class="text-2xl font-medium mb-8 text-center tracking-tight text-black">Create Account</h1>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <NeoInput
          v-model="displayName"
          label="Display Name"
          type="text"
          placeholder="Enter your display name"
          id="displayName"
          required
        />

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

        <div v-if="error || localError" class="bg-red-50 border border-red-200 text-red-600 p-3 text-sm rounded-sm" role="alert">
          <p>{{ error || localError }}</p>
        </div>

        <NeoButton type="submit" variant="primary" :block="true" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
        </NeoButton>
      </form>

      <div class="mt-6 text-center text-sm">
        <p class="text-gray-500">
          Already have an account?
          <NuxtLink to="/login" class="font-medium text-black hover:underline"> Login </NuxtLink>
        </p>
      </div>
    </NeoCard>
  </div>
</template>
