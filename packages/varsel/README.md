# Varsel

Headless yet opinionated toast notifications for Svelte applications.

## Installation

```bash
npm install varsel
```

Varsel ships only ESM and expects Svelte 5+.

## Usage

```svelte
<script>
	import { VarselToaster, toast } from "varsel";

	function notify() {
		toast.success("Saved!");
	}
</script>

<button on:click={notify}>Save</button>
<VarselToaster />
```

### Styles

`varsel/styles.css` uses Tailwind CSS v4 directives and already includes `@source "./**/*.{svelte,js}"`, so any consumer importing the stylesheet automatically exposes Varsel's class usage to Tailwind. Just make sure your tooling processes CSS from `node_modules/varsel` with Tailwind/PostCSS, then import the styles once:

```ts
// main.ts
import "varsel/styles.css";
```

### API

- `toast(description | ToastData)` – add a toast.
- `toast.success|warning|error(...)` – quick variants.
- `toast.promise(promise, options)` – bind to async work.
- `<VarselToaster />` – renders the UI; pass `expandedGap` to control stack spacing.

## Development

```bash
# build library
bun run build:package

# develop docs
bun run dev
```

## License

MIT © Marek Jóźwiak
