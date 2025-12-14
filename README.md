![Varsel toast showcase banner](apps/docs/static/og-image.jpg)

# Varsel

Varsel is a headless yet opinionated toast system for Svelte apps. This monorepo contains the publishable UI package plus the interactive documentation site that showcases every feature.

## Highlights

- **Drop-in host** – mount `<VarselToaster />` once and the library keeps the first instance active across routes.
- **Expressive API** – fire `toast()` with copy objects or quick helpers such as `toast.success`, `toast.warning`, `toast.error`.
- **Status variants** – pick between default, success, warning, and destructive palettes or override the supplied CSS variables to match your brand.
- **Positions & gestures** – anchor stacks to any corner or center edge; swipe gestures mirror automatically for the chosen position.
- **Actions & lifecycle hooks** – attach a single action button, pause timers on focus/hover, and run `onClose` callbacks after exit.
- **Promise helpers** – `toast.promise` keeps people informed while async work is running, complete with spinner states.

The package ships Tailwind CSS v4 directives and design tokens inside `varsel/styles.css`. That file already declares `@source "./**/*.{svelte,js}"`, so Tailwind picks up Varsel’s class usage automatically—just ensure your build processes CSS imported from `node_modules/varsel`.

## Repo structure

| Path | Description |
| --- | --- |
| `packages/varsel` | The Svelte component library published to npm. Contains source (`src/lib`), build config, and compiled `dist`. |
| `apps/docs` | SvelteKit site (see `/docs/*.svx`) used for live examples and usage notes. |

## Prerequisites

- [Bun](https://bun.sh/) ≥ 1.3 (repo is configured with `packageManager: "bun@1.3.3"`).

## Getting started

```bash
# install all workspace dependencies
bun install

# run the documentation site (includes playground examples)
bun run dev

# build the npm package
bun run build:package

# run type/lint checks
bun run check
bun run lint
```

The root `build` script runs both the package build and the docs build. Publishing the package from `packages/varsel` automatically triggers the library build via the `prepublishOnly` script.

## Documentation

The docs inside `apps/docs/src/routes/docs` use `.svx` pages to describe each feature in depth:

- `overview` – installation, mounting the toaster, helper shortcuts.
- `positions` – anchoring stacks and tuning the hover gap.
- `actions` – action buttons, close hooks, disabling manual dismissal.
- `variants` – status variants, theme tokens, and CSS overrides.
- `timing` – durations, hover pause behavior, manual dismissal.
- `promises` – tracking async work with `toast.promise` or manual spinners.

Run `bun run dev` and visit the `/docs` section to explore these pages interactively.

## License

MIT © Varsel Contributors
