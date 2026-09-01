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
  <div class="min-h-screen flex items-center justify-center p-4 bg-claude-bg">
    <AppCard class="w-full max-w-md p-10">
      <h1 class="text-3xl font-serif font-normal mb-8 text-center tracking-tight text-claude-text">Create Account</h1>

      <form @submit.prevent="handleRegister" class="space-y-6">
        <AppInput
          v-model="displayName"
          label="Display Name"
          type="text"
          placeholder="Enter your display name"
          id="displayName"
          required
        />

        <AppInput v-model="email" label="Email" type="email" placeholder="Enter your email" id="email" required />

        <AppInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="Choose a password"
          id="password"
          required
        />

        <AppInput
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          id="confirm-password"
          required
        />

        <div v-if="error || localError" class="bg-red-50 border border-red-200 text-red-600 p-3 text-sm rounded-none" role="alert">
          <p>{{ error || localError }}</p>
        </div>

        <AppButton type="submit" variant="primary" :block="true" :disabled="loading">
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
        </AppButton>
      </form>

      <div class="mt-6 text-center text-sm">
        <p class="text-claude-muted">
          Already have an account?
          <NuxtLink to="/login" class="font-medium text-claude-text hover:underline"> Login </NuxtLink>
        </p>
      </div>
    </AppCard>
  </div>
</template>
