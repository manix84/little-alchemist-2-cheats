# Contributing Guide 🛠️

Thanks for helping improve Little Alchemist 2 Cheats. Contributions are welcome for recipe data, UI fixes, documentation, and project maintenance.

## Good First Contributions ✨

- Correct a missing or wrong recipe in `public/data/data.json`.
- Improve README or support documentation.
- Fix layout issues on small screens.
- Improve loading, empty, or error states.
- Add focused tests for existing behavior.

## Local Setup 🚀

```bash
npm ci
npm start
```

Run the production build before opening larger pull requests:

```bash
npm run build
```

Run tests with:

```bash
npm test
```

## Data Changes 📚

Recipe data lives in `public/data/data.json`.

Please keep data changes small and reviewable:

- Use string IDs.
- Preserve the compact field names: `n`, `p`, `c`, and `prime`.
- Add source context in the issue or pull request when correcting recipes.
- Avoid unrelated formatting churn in the full JSON file.

## Code Style

- Follow the existing React, TypeScript, Material UI, and styled-components patterns.
- Prefer small, focused changes.
- Keep comments useful and brief.
- Keep generated files and build output out of commits.

## Pull Request Checklist ✅

Before opening a pull request:

- Confirm the app starts locally.
- Run relevant tests or explain why they were not run.
- For data updates, include the element names and recipes changed.
- Update documentation when behavior or setup changes.
- Link any related issue.

## Version Bumps 🔢

The repo uses a versioned Git pre-commit hook in `.githooks/pre-commit`. `npm install` runs the `prepare` script to configure Git to use that hook path.

On commit, `scripts/smart-version-bump.mjs` inspects staged files and updates `package.json` plus `package-lock.json` when release-worthy files changed:

- Docs-only changes do not bump the version.
- App UI/runtime changes bump the minor version.
- Data, config, test, workflow, and tooling changes bump the patch version.
- Staged diffs containing `BREAKING CHANGE`, `VERSION_BUMP=major`, or `version: major` bump the major version.
- Set `VERSION_BUMP=major`, `VERSION_BUMP=minor`, `VERSION_BUMP=patch`, or `VERSION_BUMP=none` before committing to override the automatic choice.

## Reporting Problems 🐛

Use the issue templates in this repository for bugs, feature requests, and data corrections. Clear reports should include what you searched for, what happened, and what you expected.
