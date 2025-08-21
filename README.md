# Pelilauta 2

A role-playing games community platform built with modern web technologies. Pelilauta 2 provides a space for RPG enthusiasts to create sites, share content, engage in discussions, and build gaming communities.

## Tech Stack

- **Frontend**: [Astro](https://astro.build/) with SSR, [Svelte 5](https://svelte.dev/) (Runes mode), [Lit](https://lit.dev/) design system
- **Backend**: [Google Firebase](https://firebase.google.com/) (Auth, Firestore, Storage)
- **Deployment**: [Vercel](https://vercel.com/) with GitHub integration
- **Styling**: Lit design system + atomic CSS classes
- **State Management**: [Nanostores](https://github.com/nanostores/nanostores)
- **Validation**: [Zod](https://zod.dev/) schemas
- **Language**: TypeScript throughout

## Architecture

### Server-Side Rendering (SSR)
- Astro handles SSR for stateless components and server-shared state
- Progressive enhancement with Svelte for interactive elements
- API routes for server-side operations

### Client-Side Interactivity
- Svelte 5 (Runes mode) for all client-side reactivity
- Nanostores for global state management
- Dynamic Firebase imports for optimal code splitting

### Firebase Integration
- Authentication with Firebase Auth
- Firestore for data storage
- Cloud Storage for file uploads
- Server-side Firebase Admin SDK for API routes

## Environment Variables

Create a `.env` file with the following Firebase configuration:

```env
# Firebase Configuration
PUBLIC_apiKey=your_firebase_api_key
PUBLIC_authDomain=your_project.firebaseapp.com
PUBLIC_databaseURL=https://your_project.firebaseio.com
PUBLIC_projectId=your_firebase_project_id
PUBLIC_storageBucket=your_project.appspot.com
PUBLIC_messagingSenderId=your_messaging_sender_id
PUBLIC_appId=your_firebase_app_id
PUBLIC_measurementId=your_measurement_id

# App Configuration
PUBLIC_APP_NAME=Pelilauta 16

# Server Configuration (for API routes)
FIREBASE_ADMIN_KEY=your_firebase_admin_service_account_json
```

### Feature Flags

```env
# Development & Testing
SECRET_FEATURE_FLAG_PASSWORD_LOGIN=true  # Enables password login for e2e tests
```

## Development

### Prerequisites
- Node.js 18+
- npm or pnpm
- Firebase project with Auth, Firestore, and Storage enabled

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables (see above)
4. Start development server:
   ```bash
   npm run dev
   ```

### Key Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run Biome linting
npm run format       # Format code with Biome
npm run type-check   # TypeScript type checking
```

## Core Features

### Sites & Communities
- Create and manage RPG gaming sites
- Invite players and manage permissions
- Rich content creation with Markdown support

### Discussions
- Threaded discussions with real-time updates
- Reply system with notifications
- Reaction system (love, bookmarks)

### Content Management
- Page creation and editing with revision history
- File uploads and asset management
- Handouts and shared documents

### Social Features
- User profiles and avatars
- Notification system
- Activity feeds and site discovery

### Integration
- Bluesky social media integration
- External link sharing with previews

## Code Patterns

### Svelte Components (Runes Mode)

```svelte
<script lang="ts">
import { uid } from '@stores/session';

interface Props {
  title: string;
  active?: boolean;
}

const { title, active = false }: Props = $props();
const isVisible = $state(false);
const buttonText = $derived.by(() => {
  return isVisible ? 'Hide' : 'Show';
});
</script>

<section class="p-2 border-radius">
  <h2>{title}</h2>
  {#if $uid}
    <button onclick={() => isVisible = !isVisible}>
      {buttonText}
    </button>
  {/if}
</section>
```

### Firebase Patterns

```ts
// Client-side (dynamic imports)
const { doc, getDoc } = await import('firebase/firestore');
const { db } = await import('@firebase/client');

// Server-side (static imports)
import { serverDB } from '@firebase/server';
```

### Schema Validation

```ts
import { SiteSchema, type Site } from '@schemas/SiteSchema';

const site = SiteSchema.parse(rawData);
```

## Deployment

The application is deployed to Vercel with automatic deployments from the main branch:

1. Connect repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main

## Contributing

1. Follow the established code patterns
2. Use proper TypeScript types
3. Validate data with Zod schemas
4. Follow 2-space indentation (Biome)
5. Use shorthand import paths (`@schemas/`, `@utils/`, etc.)
6. Log errors with proper context

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.