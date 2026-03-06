# Quality Standards

This document defines the quality standards for the Garden of Makers project.

## Validation Commands

All code must pass the following validation before being committed:

```bash
npm run lint         # ESLint — zero errors
npm run test         # Vitest — all tests pass
npm run i18n:check   # en-US and pt-BR translation keys in sync
npm run build        # Next.js production build — catches type errors
```

**All four must pass with zero errors before any code is considered ready.**

## Rules

### 1. No Hardcoded Strings
All user-facing text goes through `next-intl` via `useTranslations`. Every key must exist in both `en-US.json` and `pt-BR.json`.

### 2. No Business Logic in Routes
Routes handle HTTP, auth, validation. Logic lives in Services.

### 3. Providers Are Dumb
Providers translate TrustMRR API responses to internal types. No business logic.

### 4. Services Are Focused
One domain per service. Use Facades to orchestrate.

### 5. Server-Side API Calls Only
TrustMRR API key never exposed to client. All calls via server components or API routes.

### 6. Type Everything
No `any`. Provider types mirror TrustMRR exactly. Service types are internal domain types.

### 7. Test Business Logic
`TreeCalculator`, `ForestLayoutEngine`, fruit breakdown, tier mapping. Minimum 25 unit tests before launch.

### 8. Cache Aggressively
TrustMRR rate limit is 20/min. ISR (1h revalidation) + database cache + in-memory cache.

### 9. RLS on Every Table
No exceptions. Row Level Security policies required for all Supabase tables.

### 10. Monetary Values in Cents
Match TrustMRR convention. Convert to dollars only at render time.

## Pre-Commit Checklist

- [ ] `npm run lint` passes with zero errors
- [ ] `npm run test` passes with all tests
- [ ] `npm run build` completes successfully
- [ ] All new strings are i18n-ready
- [ ] No `any` types introduced
- [ ] RLS policies updated if schema changed
