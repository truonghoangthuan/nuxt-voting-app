<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';

const router = useRouter();
const { user, logout } = useAuth();
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center bg-claude-bg text-claude-text py-20">
    <div class="w-full max-w-5xl px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      
      <!-- Left side: Hero Text -->
      <div>
        <div class="font-serif text-xl text-claude-muted mb-10 tracking-tight">VotingApp.</div>
        
        <h1 class="font-serif text-5xl lg:text-6xl font-normal leading-tight mb-6 tracking-tight">
          Collect votes.<br/>Without the noise.
        </h1>
        
        <p class="text-claude-muted text-lg leading-relaxed max-w-md mb-10">
          A minimalist polling platform for teams. Create a poll in seconds, see results in real-time.
        </p>
        
        <div class="flex flex-wrap gap-4">
          <NuxtLink to="/create" class="inline-flex items-center justify-center px-6 py-3 bg-claude-text text-claude-bg rounded-lg font-medium hover:bg-black transition-colors duration-200">
            Start Polling
          </NuxtLink>
          <template v-if="!user">
            <NuxtLink to="/login" class="inline-flex items-center justify-center px-6 py-3 bg-transparent text-claude-text rounded-lg font-medium border border-claude-border hover:bg-claude-card transition-colors duration-200">
              Log In
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/history" class="inline-flex items-center justify-center px-6 py-3 bg-transparent text-claude-text rounded-lg font-medium border border-claude-border hover:bg-claude-card transition-colors duration-200">
              History
            </NuxtLink>
            <button @click="logout" class="inline-flex items-center justify-center px-6 py-3 bg-transparent text-claude-text rounded-lg font-medium border border-claude-border hover:bg-claude-card transition-colors duration-200">
              Log Out
            </button>
          </template>
        </div>
      </div>
      
      <!-- Right side: Floating Poll Card (Option 3 style) -->
      <div class="bg-claude-card border border-claude-border rounded-2xl p-8 lg:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div class="font-medium text-lg mb-8 text-claude-text">Where should we host the offsite?</div>
        
        <div class="mb-5">
          <div class="flex justify-between items-center mb-2 text-sm">
            <span>Berlin</span>
            <span class="text-claude-muted">18 votes (60%)</span>
          </div>
          <div class="h-8 bg-claude-bg rounded-md border border-claude-border overflow-hidden">
            <div class="h-full bg-claude-accent w-[60%]"></div>
          </div>
        </div>
        
        <div>
          <div class="flex justify-between items-center mb-2 text-sm">
            <span>Tokyo</span>
            <span class="text-claude-muted">12 votes (40%)</span>
          </div>
          <div class="h-8 bg-claude-bg rounded-md border border-claude-border overflow-hidden">
            <div class="h-full bg-claude-accent/20 w-[40%]"></div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
