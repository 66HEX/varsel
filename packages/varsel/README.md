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

<button onclick={notify}>Save</button>
<VarselToaster />
```

### Styles

Varsel ships with a **prebuilt CSS file**, meaning it works out of the box without requiring you to configure Tailwind CSS or PostCSS in your application.

Simply import the styles once in your root layout or entry file:

```ts
// src/routes/+layout.svelte (or main.ts)
import "varsel/styles.css";
```

The styles are fully self-contained and scoped, using CSS variables for easy theming.

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
