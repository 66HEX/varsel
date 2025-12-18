# Changelog

All notable changes to **Varsel** will be documented in this file.  
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),  
and the project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.4.0] – 2025-12-18

### Added

- **Enhanced Toaster Configuration**  
  The `<VarselToaster />` component now accepts a comprehensive set of props for global configuration:
  - `position` (default: `'bottom-center'`): Sets the default placement for toasts.
  - `visibleToasts` (default: `3`): Controls the maximum number of toasts visible at once.
  - `expand` (default: `true`): Determines if the toast stack expands on hover.
  - `duration` (default: `5000`): Sets the default auto-dismiss timer in milliseconds.
  - `closeButton` (default: `true`): Toggles the visibility of the close button.
  - `pauseOnHover` (default: `true`): Pauses the timer when the user hovers over a toast.
  - `offset` (default: `undefined`): Adds custom spacing from the viewport edges.
  - `dir` (default: `'auto'`): specifices text direction ('ltr', 'rtl', or 'auto').

- **API Reference Documentation**  
  Added a dedicated "API Reference" page to the documentation site, providing detailed information on all exported components, functions, and types.

## [0.3.0] – 2025-12-16

### Added

- **Headless Custom Toasts**  
  Introduced `toast.custom(Component, options)` API, allowing developers to render completely custom Svelte components as toasts. This provides full control over markup and styling while retaining Varsel's positioning and animation logic.
- **Strict Typing for Custom Toasts**  
  Implemented robust TypeScript support for custom components, ensuring type safety for component props passed via `toast.custom()`.
- **Documentation for Headless Usage**  
  Added a new "Headless & Custom" documentation section with live examples and code snippets.

### Changed

- **Refined Animation Tokens**  
  Standardized cubic-bezier easing functions as CSS variables (`--ease-vs-pop` and `--ease-vs-toast`) for better consistency and easier theming customization.

### Fixed

- **Mobile Swipe Dismiss**  
  Added `touch-action: none` to toast elements to prevent browser scrolling from interfering with swipe-to-dismiss gestures on touch devices.

## [0.2.0] – 2025-12-15

### Changed

- **Svelte 5 Runes Migration**  
  Complete internal refactor of all components (`VarselToaster`, `VarselManager`, `VarselItem`) to use the new Svelte 5 Runes syntax (`$state`, `$props`, `$derived`, `$effect`). This modernizes the codebase and aligns with the future of the Svelte ecosystem while maintaining full backward compatibility with the public API.

### Added

- **Comprehensive JSDoc Documentation**  
  All core modules, types, and components are now fully documented with JSDoc comments, improving IntelliSense support and developer experience.

- **Robust Testing Suite**  
  Introduced a complete testing infrastructure using **Vitest** and **Testing Library**.
  - **Unit Tests**: Full coverage for state logic (`toast-state`).
  - **Integration Tests**: Verification of component rendering and API interactions.
  - **Accessibility Tests**: Automated checks (`vitest-axe`) for ARIA roles, live regions, and keyboard navigation.
  - **Interaction Tests**: Coverage for complex behaviors like stacking limits, action callbacks, and queue management.

- **Performance Improvements**  
  - Reduced reactivity overhead by leveraging fine-grained Runes.

### Fixed

- **Timer Optimization**  
  Prevented `setTimeout` execution for toasts with `duration: Infinity`, eliminating Node.js warnings during tests and reducing unnecessary timer scheduling.
  
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
