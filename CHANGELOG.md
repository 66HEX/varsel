# Changelog

All notable changes to **Varsel** will be documented in this file.  
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and the project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.1.1] – 2025-12-14

### Added

- **Prebuilt CSS output** – the library now ships a fully generated `styles.css` file.
- **CSS export entry** – consumers can import styles via:
  ```css
  @import "varsel/styles.css";
  ```
- **Theme tokens as CSS variables** – all colors, radii, shadows, easing curves, and motion tokens are exposed via `--vs-*` custom properties for easy theming without Tailwind.
- **Dark mode variables** – automatic dark palette via `.dark` selector.

### Changed

- **Tailwind is now build-time only**  
  Varsel no longer requires consumers to use Tailwind CSS. Tailwind is used exclusively to generate the final CSS during the library build.

- **More reliable production builds**  
  Removes reliance on Tailwind source scanning in consuming apps, eliminating issues with monorepos, Vercel deployments, and dynamic class generation (CVA).

- **Improved portability**  
  The library can now be safely consumed by:
  - non-Tailwind Svelte apps
  - SvelteKit apps with any CSS setup
  - mixed or legacy codebases

### Fixed

- Missing styles in production when using dynamic class composition (e.g. class-variance-authority).
- Inconsistent behavior between local development and deployed builds.
- Edge cases where Tailwind utilities were not generated due to runtime-only class resolution.

### Developer Experience

- Deterministic CSS generation during build
- No Tailwind configuration required for consumers
- Clear separation between:
  - library styling concerns
  - application styling concerns

---

## [0.1.0] – Initial release

### Added

- First public, working release of Varsel.
- Headless yet opinionated toast system for Svelte.
- Core features:
  - Drop-in `<VarselToaster />` host
  - Programmatic `toast()` API with helpers (success, warning, error)
  - Status variants with semantic styling
  - Multiple stack positions with mirrored swipe gestures
  - Action buttons and lifecycle hooks
  - Hover/focus pause behavior
  - Promise helpers with loading and finishing states
- Fully interactive documentation site with live examples.
