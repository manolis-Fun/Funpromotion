# Repository Guidelines

## Project Structure & Module Organization
Next.js App Router routes live in `src/app` with feature folders such as `product`, `wishlist`, and API endpoints. Legacy handlers stay under `src/pages/api`. Shared UI components live in `src/components`, Redux slices in `src/store`, helpers in `src/utils`, and static assets in `public`. Styling flows through `src/app/globals.css` plus Tailwind classes. Tooling folders (`perf/`, `standalone-search-server/`) host perf harnesses and Elasticsearch scripts; keep them separate from deployable code.

## Build, Test, and Development Commands
- `npm run dev` — start the dev server on :3000; use `dev:clean` or `dev:reset` when `.next` cache causes stale data.
- `npm run build` — create the production bundle and validate TypeScript.
- `npm run start` — serve the built app locally for QA.
- `npm run lint` — run `next lint` (ESLint + TypeScript + Tailwind plugins).
- `npx jest` (or `npx jest src/utils/computePrice.test.js`) — run the colocated unit tests.

## Coding Style & Naming Conventions
Favor functional React components with hooks, server components for data fetching, and two-space indentation. Use single quotes in JS/TS, clear prop names, and Tailwind utility classes instead of ad-hoc CSS. Components and exported modules use `PascalCase`, hooks/utilities use `camelCase`, and TypeScript contracts end with `Props` or `Dto`. Run ESLint autofix rather than manual formatting.

## Testing Guidelines
Test files sit next to the code with a `.test.(js|ts)` suffix (see `src/utils/computePrice.test.js`). Stick to Jest’s `describe`/`test`, deterministic numeric assertions, and lightweight fixtures for Searchkit or Redux interactions. Every helper touching pricing, filtering, or Redux selectors should have a happy-path test plus at least one invalid-input test. Document the `npx jest …` command you ran in the PR so reviewers can reproduce.

## Commit & Pull Request Guidelines
Git history shows short, lowercase, imperative subjects (`search fix`, `rm temp file`); keep them under ~60 characters and scope each commit tightly. PRs need a short summary, linked issue/card, screenshots for UI updates, and a checklist of verified commands (`npm run build`, `npm run lint`, relevant tests). Mention environment or data changes explicitly so ops can update Vercel secrets.

## Environment & Configuration Tips
Store secrets in `.env.local` (excluded from git) and hydrate it from `.env` or `standalone-search-server/.env.example`. Never commit credentials; production vars live in Vercel and the standalone search server. When adding new configuration, note the variable name and default in the PR. Set `DEBUG=1 npm run dev` while touching Elasticsearch/Searchkit plumbing to surface fetch logs.
