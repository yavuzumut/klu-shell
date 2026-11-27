<h1><img src="public/klu-mascot-512.png" alt="KLU" width="72" align="absmiddle" /> KLU</h1>

KLU is a browser-based, bilingual (Turkish and English) simulator for learning Linux terminal and Git. It runs locally in the browser with an in-memory virtual filesystem; its shell and Git remotes are simulations, not a real operating system or remote Git host.

**[Open the live demo](https://klu-shell.pages.dev/)**

## Features

- 33 Linux commands across 28 lessons in Levels 0–3
- Four interactive Git levels, including hands-on merge conflict resolution
- Live virtual file tree and a separate sandbox mode
- Linux command cheat sheet and Explore guide to external tools
- Turkish and English interface and lesson content
- Five themes, plus a custom accent color
- Offline-ready PWA app shell
- JSON export and import for Linux and Git progress

## Run locally

Requires Node.js 22.12 or newer.

```bash
npm install
npm run dev
npm test
npm run build
```

## Project guides

- [Architecture](ARCHITECTURE.md)
- [Internationalization guide](I18N_GUIDE.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT. See [LICENSE](LICENSE).
