# Nuxt Voting App

A real-time voting application built with **Nuxt 3**, featuring a **Neo-Brutalism** design aesthetic and live updates using Server-Sent Events (SSE).

## Features

- 🗳️ **Create Polls**: Easily create polls with a question and multiple options.
- ⚡ **Real-time Updates**: Watch vote counts update instantly across all connected clients without refreshing.
- 🎨 **Neo-Brutalism Design**: Styled with a bold, high-contrast aesthetic using TailwindCSS.
- 📱 **Responsive**: Fully responsive interface that works on mobile and desktop.
- 🔄 **Animations**: Smooth transitions and animations using `@vueuse/motion`.
- 👤 **User Identification**: Seamlessly identify users with a persistent name entry dialog.
- 👁️ **Voter Transparency**: Click on any option to see exactly who voted for it.
- 🚫 **Duplicate Prevention**: Local storage persistence ensures users can only vote once per poll.
- 🔗 **Easy Sharing**: One-click copy-to-clipboard button to share polls instantly.

## Tech Stack

- **Framework**: [Nuxt 3](https://nuxt.com)
- **UI Engine**: [Vue 3](https://vuejs.org)
- **Styling**: [TailwindCSS](https://tailwindcss.com) + `tailwind-merge` + `clsx`
- **Animations**: [VueUse Motion](https://motion.vueuse.org/)
- **Server**: Nuxt Server Routes (Nitro)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm, pnpm, yarn, or bun

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd nuxt-voting-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:

```bash
npm run dev
```

Visit `http://localhost:3000` to see the app in action.

### Build for Production

Build the application for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

- `components/`:
  - `ui/`: Reusable UI components (NeoButton, NeoCard, NeoInput, etc.)
  - `UserNameDialog.vue`: Global user identification modal
  - `WelcomeBanner.vue`: Persistent welcome display
- `pages/`: Application views and routing
  - `index.vue`: Create poll page
  - `vote/[id].vue`: Voting page (dynamic route)
- `server/`: Backend logic
  - `api/`: API endpoints for voting and polling
  - `utils/`: Server-side utilities (storage, etc.)
- `composables/`: Shared state logic
  - `usePolls.ts`: Polling logic
  - `useUser.ts`: User name management
  - `useUserVotes.ts`: Local voting state persistence

## License

[MIT](LICENSE)
