# Repository Guidelines
- 사용자는 소프트웨어 개발자이며 너는 완벽한 개발자이다.
- 개발자는 한국인으므로 한글로 의사소통을 진행한다.
- 개발전 정확하며 최선에 계획을 세우고 개발 순서를 생각하여 작성한 계획에 대해 개발자에게 동의를 구하고 진행한다. 

## Project Structure & Module Organization
Next.js 15 App Router drives everything under `app/`. Routes such as `app/page.tsx` and `app/blog/<topic>` render UI components from `app/components/{Blog,layout,search,ui}`. Blog metadata lives beside Markdown fragments in `app/data/blog/<topic>/<slug>.ts` and `contents/`. Keep shared config in `app/constants`, providers in `app/context`, helpers in `app/lib`, styles in `app/globals.css`, and static assets or sitemap outputs in `public/`.

## Build, Test, and Development Commands
- `npm install` — install dependencies when `package.json` or lockfiles change.
- `npm run dev` — Turbopack dev server on http://localhost:3000 for fast previews.
- `npm run lint` — Next.js ESLint rules; run before committing.
- `npm run build` — production bundle plus sitemap regeneration via `next-sitemap`.
- `npm run export` — emit the static site into `out/`; `npm run deploy` adds `.nojekyll` and publishes `out/` through `gh-pages`.

## Coding Style & Naming Conventions
Write TypeScript with 4-space indentation, single quotes, and explicit return types on exported helpers. Components and files are PascalCase, hooks/utilities camelCase, and blog arrays follow `<topic>Posts` (e.g., `jpaPosts`). Keep `use client` directives at the top, prefer named exports, and organize Tailwind classes roughly by layout → spacing → color to keep diffs tidy.

## Testing Guidelines
Automated tests are not yet committed; add Jest + React Testing Library (or a similar stack) whenever introducing non-trivial logic. Place specs as `*.test.ts[x]` in a nearby `__tests__` folder, covering markdown parsing, filters, and interactive widgets. Aim for meaningful coverage on new lib or context modules, document manual viewport/syntax checks in the PR, and finish every change with `npm run lint` plus a quick `npm run dev` smoke run to catch hydration issues.

## Commit & Pull Request Guidelines
History mixes English and Korean subjects with short prefixes (`feat: netty`, `백준 단어공부`). Keep the `type: summary` pattern (`feat`, `fix`, `docs`, `chore`), squash noisy WIP commits, and mention the `app/data/blog/...` paths touched. PRs should include a concise description, screenshots or recordings for UI changes, linked issues or checklists, and the commands you ran (`lint`, `build`, optional `export`) before requesting review.

## Deployment & Configuration Tips
Exports target GitHub Pages, so avoid Node-only runtime APIs and prefer relative asset paths. Keep `next-sitemap.config.js` aligned with the `homepage` in `package.json`, and regenerate `out/` after routing or metadata changes. Secrets are unsupported at runtime; rely on `NEXT_PUBLIC_` env vars and document them in a future `.env.example` if configuration becomes necessary.
