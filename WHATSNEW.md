# What's New ✨

This file tracks notable project changes in a lightweight, human-readable format.

## Unreleased 🧪

- Expanded the README with setup, data, contribution, and community health guidance.
- Added GitHub community health files so contributors know how to report bugs, suggest data fixes, request features, and get support.
- Added issue and pull request templates to make reports easier to triage.
- Documented the current recipe dataset snapshot: 720 elements and 3,455 known recipes.
- Replaced Create React App with Vite and Vitest to remove stale tooling and keep `npm audit` clean.
- Added a smart pre-commit version bump hook with override support.
- Added PWA support with a generated service worker, installable manifest, and a subtle install prompt that respects dismissal.
- Downloaded Little Alchemy image assets into `public/` so the app no longer depends on external image hosts at runtime.
- Added a PWA offline verification script that checks the generated service worker precaches the app shell, recipe data, logo, and all element icons.
- Added a privacy policy covering local browser storage, offline cache behavior, the no-analytics/no-ads project model, and how to clear local data.
- Replaced official-looking app and header logos with distinct hints/cheats branding so installed shortcuts are clearly for this fan guide.

## 0.1.0 🌱

- Published the first client-side Little Alchemist 2 combination search app.
- Added searchable element lookup with recipe and "makes" views.
- Added GitHub Pages deployment support.
