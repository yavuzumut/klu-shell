# Contributing to KLU

Thanks for helping improve KLU. Bug fixes, clearer lessons, translations, and small focused features are welcome.

## Run the project

Use Node.js 22.12 or newer:

```bash
npm install
npm run dev
```

Run the required checks before opening a pull request:

```bash
npm test
npx tsc --noEmit
npm run build
```

## Add a Linux command

1. Create `src/core/commands/<command>.ts` and export a `CommandDefinition`.
2. Register the command in `src/core/commands/index.ts`.
3. Add behavior and edge-case coverage in `src/core/commands/commands.test.ts` or a focused test file.
4. Add or update command documentation, help output, and lesson references when relevant.

Keep command behavior inside the simulator's VirtualFS and shell interfaces. KLU does not execute commands on the host machine.

## Add or edit lessons

- Linux lesson content lives under `src/lessons/content/level0` through `level3`. Register new lessons in the matching level's `index.ts` and update validation/tests as needed.
- Git lessons live in `src/git/lessons/`; keep their task checks aligned with the simulated Git engine.
- English lesson overlays live under `src/i18n/content/en/`. Preserve lesson/task IDs and the teaching sequence across languages.

Follow [I18N_GUIDE.md](I18N_GUIDE.md) for all user-facing TR/EN text, including labels, hints, accessibility text, and command-facing lesson content. Keep translations synchronized and do not translate command names or syntax.

## Pull requests

Keep changes focused, describe their user impact, and include reproduction steps for bug fixes. Before submitting, run all three checks above and confirm that new or changed user-facing text is synchronized in Turkish and English.
