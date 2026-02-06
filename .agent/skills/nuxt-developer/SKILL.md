---
name: nuxt-developer
description: Expert Nuxt 4 developer skill for the nuxt-voting-app project
---

# Nuxt Developer Skill

You are an expert Nuxt 4 developer working on the `nuxt-voting-app`. This project is a modern voting application built with the latest Vue ecosystem tools.

## Technology Stack

- **Framework**: [Nuxt 4](https://nuxt.com) (Compatibility Date: 2025-07-15)
- **UI Library**: [Vue 3](https://vuejs.org) (v3.5+)
- **Styling**: [Tailwind CSS](https://tailwindcss.com) (v3.4+)
- **Animations**: [@vueuse/motion](https://motion.vueuse.org/)
- **Utility**: `clsx` and `tailwind-merge` for dynamic class construction.

## Project Architecture

### Directory Structure

- **`components/`**: Reusable Vue components. Note: Components are auto-imported. Files in subdirectories can be used without explicit imports. The project uses `pathPrefix: false`, so a component at `components/base/Button.vue` is used as `<Button />`, NOT `<BaseButton />`.
- **`composables/`**: Auto-imported logic and state management.
    - `usePolls.ts`: Logic for handling polls.
    - `useUser.ts`: User session management.
    - `useUserVotes.ts`: Managing user votes.
- **`pages/`**: File-based routing.
- **`server/`**: Server-side logic using H3.
    - `api/`: API routes (e.g., `/api/polls`).
- **`assets/`**: Static assets like CSS and images.

### Key Concepts

#### Data Fetching
- Use **`useFetch`** (or `useAsyncData`) in components for data fetching that is SSR-friendly.
- Use **`$fetch`** for client-side interactions (like POST requests in event handlers) or within server routes to call other APIs.

#### State Management
- Use `useState` (Nuxt's shared state) within composables for simple global state.
- Keep logic inside `composables/` to separate business logic from UI components.

#### Styling
- Use **Tailwind CSS** utility classes.
- For conditional classes, ALWAYS use the `cn` helper pattern (if available) or `clsx` + `tailwind-merge`.
- Example:
  ```vue
  <script setup lang="ts">
  import { twMerge } from 'tailwind-merge'
  import { clsx, type ClassValue } from 'clsx'

  function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
  }
  </script>
  
  <template>
    <div :class="cn('px-4 py-2 bg-blue-500', props.class)">
       <slot />
    </div>
  </template>
  ```

#### Server Routes
- Located in `server/api`.
- defineEventHandler((event) => { ... })
- Use `readBody(event)` for POST data.
- Use `getQuery(event)` for query parameters.

## Coding Standards

### Vue Components
- Use `<script setup lang="ts">`.
- Use TypeScript for all script blocks.
- Define props using `defineProps<{ ... }>()`.
- Define emits using `defineEmits<{ ... }>()`.

### Best Practices
1. **Auto-imports**: Do NOT manually import `ref`, `computed`, `watch`, `useFetch`, `useRouter`, etc. Nuxt handles this.
2. **Type Safety**: Ensure strict typing for props, emits, and API responses.
3. **Performance**: Use `Lazy` prefix for components (e.g., `<LazyModal />`) if they are not needed immediately.
4. **Motion**: Use `v-motion` directives for animations where appropriate to enhance UX.

## Common commands

- `npm run dev`: Start development server.
- `npm run build`: Build for production.
