# Little Alchemist 2 Cheats 🧪

[![Deployment](https://github.com/manix84/little-alchemist-2-cheats/actions/workflows/deploy.yml/badge.svg)](https://github.com/manix84/little-alchemist-2-cheats/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A quick, client-side search engine for Little Alchemist 2 combinations.

The app lets you pick an element and see both sides of the recipe book:

- **Combinations**: the recipes that create the selected element.
- **Makes**: the elements you can create by combining the selected element with something else.
- **Element pages**: each element has a clean URL, such as `/elements/fire`, for sharing and direct loading.
- **Fast local data**: recipes and image assets are served from `public/`.

## Try It ✨

Open the live app here:

https://manix84.github.io/little-alchemist-2-cheats

## Tech Stack 🛠️

- React 18
- TypeScript
- Material UI
- styled-components
- Vite
- Vitest
- PWA service worker support
- GitHub Pages deployment

## Getting Started 🚀

Install dependencies:

```bash
npm ci
```

Start the local dev server:

```bash
npm start
```

Run tests:

```bash
npm test
```

Create a production build:

```bash
npm run build
```

Verify the built PWA precache includes the app shell, recipe data, and local image assets:

```bash
npm run pwa:verify
```

## Data Notes 📚

The searchable recipe data lives in `public/data/data.json`.

Each element entry is keyed by element ID and can include:

- `n`: display name.
- `s`: URL slug.
- `p`: pairings that produce that element.
- `c`: elements this element can help create.
- `d`: DLC marker, currently `myths-and-monsters`.
- `prime`: marker for base elements.

Current dataset snapshot:

- 830 elements
- 3,863 known recipes
- 606 elements with outbound "makes" data

When changing recipe data, keep IDs as strings and preserve the compact field names so the app can continue loading quickly in the browser.

Refresh recipe data from the current Little Alchemy hints site with:

```bash
npm run data:refresh
```

The refresh script pulls the official item list, downloads each `item_data/*.json` file, tags Myths and Monsters DLC content, rebuilds `p` from the parent recipe HTML, and regenerates `c` from those recipes. After refreshing data, run `npm run assets:download` so any newly discovered element icons are stored locally too.

## Local Assets 🖼️

Element icons live in `public/elements/`, and the header logo lives in `public/brand/`.

Refresh the local asset cache with:

```bash
npm run assets:download
```

The app should not need to fetch Little Alchemy image assets from an external site at runtime.

## PWA Support 📲

The app is installable on supported browsers and precaches the built app shell, recipe data, logo, and element icons for offline use. The install prompt is intentionally subtle and stores a dismissal locally, so it will not keep reappearing after someone closes it.

## Project Structure 🗂️

```text
public/data/data.json  Recipe data used by the app
public/elements/       Local element SVG icons
public/brand/          Local brand/logo assets
src/App.tsx            Main search and recipe display UI
src/lib/Data.ts        Data loading and lookup helpers
public/404.html        GitHub Pages fallback for direct clean URLs
.github/workflows/     Build and GitHub Pages deployment
```

## Contributing 🤝

Issues and pull requests are welcome, especially for:

- Missing or incorrect combinations.
- Search or display bugs.
- Accessibility and mobile usability improvements.
- Documentation fixes.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Community Health 💚

- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Privacy Policy](PRIVACY.md)
- [Security Policy](SECURITY.md)
- [Support Guide](SUPPORT.md)
- [What's New](WHATSNEW.md)

## License ⚖️

This project is released under the [MIT License](LICENSE).
