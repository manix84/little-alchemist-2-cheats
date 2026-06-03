# Little Alchemist 2 Cheats 🧪

[![Deployment](https://github.com/manix84/little-alchemist-2-cheats/actions/workflows/deploy.yml/badge.svg)](https://github.com/manix84/little-alchemist-2-cheats/actions/workflows/deploy.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A quick, client-side search engine for Little Alchemist 2 combinations.

The app lets you pick an element and see both sides of the recipe book:

- **Combinations**: the recipes that create the selected element.
- **Makes**: the elements you can create by combining the selected element with something else.
- **Fast local data**: recipes load from `public/data/data.json`, while element icons are fetched from the official Little Alchemy 2 hints assets.

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

## Data Notes 📚

The searchable recipe data lives in `public/data/data.json`.

Each element entry is keyed by element ID and can include:

- `n`: display name.
- `p`: pairings that produce that element.
- `c`: elements this element can help create.
- `prime`: marker for base elements.

Current dataset snapshot:

- 720 elements
- 3,455 known recipes
- 535 elements with outbound "makes" data

When changing recipe data, keep IDs as strings and preserve the compact field names so the app can continue loading quickly in the browser.

## Project Structure 🗂️

```text
public/data/data.json  Recipe data used by the app
src/App.tsx            Main search and recipe display UI
src/lib/Data.ts        Data loading and lookup helpers
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
- [Security Policy](SECURITY.md)
- [Support Guide](SUPPORT.md)
- [What's New](WHATSNEW.md)

## License ⚖️

This project is released under the [MIT License](LICENSE).
