# Garden of Makers

> Your revenue, visualized as a living forest.

Every startup is a tree. MRR determines height. Customers become fruits. Powered by verified revenue data from TrustMRR.

## Concept

Garden of Makers transforms verified startup revenue data into an interactive 3D forest. Each startup registered on TrustMRR becomes a tree that grows based on real MRR. Visitors fly through the forest, discover startups, and compare gardens.

## Tech Stack

- **Next.js 16** - App Router, API routes, SSR/ISR, Turbopack
- **React 19** - UI components
- **TypeScript 5** - Type safety
- **Three.js** - 3D engine via @react-three/fiber + drei
- **Supabase** - PostgreSQL, GitHub OAuth, Row Level Security
- **Tailwind CSS 4** - Styling with pixel font (Silkscreen)
- **Vitest** - Unit + integration tests
- **next-intl** - i18n (en-US + pt-BR)

## Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev

# Run tests
npm run test

# Run linter
npm run lint

# Build for production
npm run build
```

## Project Structure

```
src/
├── app/           # Next.js App Router
├── components/    # React components
├── lib/           # Utilities, providers, services
├── hooks/         # Custom React hooks
├── messages/      # i18n translations
└── types/         # Global TypeScript types
```

## Architecture

Following the **Provider-Service-Facade-Route** pattern:

- **Providers** (`src/lib/providers/`) - Wrappers for external APIs
- **Services** (`src/lib/services/`) - Domain logic
- **Facades** - Orchestration between services
- **Routes** (`src/app/api/`) - HTTP handling

## License

MIT
