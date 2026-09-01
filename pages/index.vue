<script setup lang="ts">
import { useAuth } from '~/composables/useAuth';

const { loading } = useAuth();
</script>

<template>
  <div>
    <!-- Show a loading state while auth is determining if user is logged in -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center bg-white">
      <AppLoader />
    </div>
    
    <!-- Show the Landing Page for everyone -->
    <LandingPage v-else />
  </div>
</template>
