<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';

const router = useRouter();
const { user, logout } = useAuth();
</script>

<template>
  <div class="flex flex-col lg:flex-row min-h-screen w-full">
    <!-- Left Pane (Sticky) -->
    <div class="flex-1 lg:sticky lg:top-0 lg:h-screen flex flex-col justify-between p-12 lg:p-16 border-b lg:border-b-0 lg:border-r border-swiss-border bg-swiss-bg">
      <div class="font-semibold text-xl tracking-tight">VotingApp.</div>
      
      <div class="my-auto lg:my-0 lg:mt-32">
        <h1 class="text-5xl lg:text-6xl font-medium tracking-tight leading-tight mb-6">
          Collect votes.<br/>Without the noise.
        </h1>
        <p class="text-swiss-muted text-lg leading-relaxed max-w-md mb-10">
          A minimalist polling platform for teams. Create a poll in seconds, see results in real-time.
        </p>
        <div class="flex flex-wrap gap-4">
          <NuxtLink to="/create" class="inline-flex items-center justify-center px-8 py-4 bg-swiss-black text-swiss-white font-medium hover:bg-transparent hover:text-swiss-black border border-swiss-black transition-colors duration-200">
            Start Polling
          </NuxtLink>
          <template v-if="!user">
            <NuxtLink to="/login" class="inline-flex items-center justify-center px-8 py-4 bg-transparent text-swiss-black font-medium hover:bg-swiss-black hover:text-swiss-white border border-transparent hover:border-swiss-black transition-colors duration-200">
              Log In
            </NuxtLink>
          </template>
          <template v-else>
            <NuxtLink to="/history" class="inline-flex items-center justify-center px-8 py-4 bg-transparent text-swiss-black font-medium hover:bg-swiss-black hover:text-swiss-white border border-transparent hover:border-swiss-black transition-colors duration-200">
              History
            </NuxtLink>
            <button @click="logout" class="inline-flex items-center justify-center px-8 py-4 bg-transparent text-swiss-black font-medium hover:bg-swiss-black hover:text-swiss-white border border-transparent hover:border-swiss-black transition-colors duration-200">
              Log Out
            </button>
          </template>
        </div>
      </div>
      
      <div class="font-mono text-xs text-swiss-muted mt-12 lg:mt-auto">
        © 2026. Swiss Light Mode.
      </div>
    </div>
    
    <!-- Right Pane (Scrollable) -->
    <div class="flex-1 bg-swiss-hover flex flex-col">
      <!-- Feature 1 -->
      <div class="px-12 lg:px-16 py-24 border-b border-swiss-border bg-swiss-bg">
        <span class="font-mono text-xs text-swiss-cyan uppercase block mb-4">01 / CAPABILITY</span>
        <h3 class="text-3xl font-medium tracking-tight mb-4">Real-time Results</h3>
        <p class="text-lg text-swiss-muted leading-relaxed">
          Powered by Server-Sent Events. The moment someone votes, your screen updates.
        </p>
        
        <div class="mt-12 border border-swiss-border rounded-sm bg-swiss-white p-6 lg:p-8 shadow-sm">
          <div class="font-medium mb-6">Where should we host the offsite?</div>
          
          <div class="flex justify-between items-center py-4 border-b border-swiss-border">
            <div class="flex items-center">
              Tokyo <span class="font-mono text-xs text-swiss-muted ml-3">12 votes</span>
            </div>
            <div class="font-medium">40%</div>
          </div>
          <div class="h-1 bg-swiss-black mt-2 w-[40%]"></div>
          
          <div class="flex justify-between items-center py-4 border-b border-swiss-border mt-4">
            <div class="flex items-center">
              Berlin <span class="font-mono text-xs text-swiss-muted ml-3">18 votes</span>
            </div>
            <div class="font-medium text-swiss-cyan">60%</div>
          </div>
          <div class="h-1 bg-swiss-cyan mt-2 w-[60%]"></div>
        </div>
      </div>

      <!-- Feature 2 -->
      <div class="px-12 lg:px-16 py-24 border-b border-swiss-border bg-swiss-bg">
        <span class="font-mono text-xs text-swiss-cyan uppercase block mb-4">02 / TRANSPARENCY</span>
        <h3 class="text-3xl font-medium tracking-tight mb-4">Know who voted.</h3>
        <p class="text-lg text-swiss-muted leading-relaxed">
          No more anonymous cowardice. Every vote is tied to a name, creating an accountable decision-making process.
        </p>
      </div>

      <!-- Feature 3 -->
      <div class="px-12 lg:px-16 py-24 border-b border-swiss-border bg-swiss-bg">
        <span class="font-mono text-xs text-swiss-cyan uppercase block mb-4">03 / PERFORMANCE</span>
        <h3 class="text-3xl font-medium tracking-tight mb-4">Lightweight & Fast</h3>
        <p class="text-lg text-swiss-muted leading-relaxed">
          Built on Nuxt 3 and Nitro. No heavy client-side bundles, just pure speed and native browser APIs.
        </p>
      </div>
    </div>
  </div>
</template>
