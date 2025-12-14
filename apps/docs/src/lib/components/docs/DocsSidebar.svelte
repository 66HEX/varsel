<script lang="ts">
import { browser } from "$app/environment";
import { page } from "$app/state";
import { onMount } from "svelte";
import { cn } from "$lib/utils/cn";
import type { DocNavGroup } from "$lib/docs/navigation";

let { links = [] } = $props<{ links: DocNavGroup[] }>();
const currentPage = page;

type ThemeMode = "light" | "dark" | "system";
type ConcreteTheme = Exclude<ThemeMode, "system">;
let theme = $state<ThemeMode>("system");
let isMobileNavOpen = $state(false);
let sidebarElement: HTMLElement | null = null;
let desktopMediaQuery: MediaQueryList | null = null;
let isDesktop = false;
let systemPreference: ConcreteTheme = "light";

const resolveTheme = (value: ThemeMode): ConcreteTheme =>
	value === "system" ? systemPreference : value;

const applyTheme = (value: ThemeMode) => {
	if (!browser) return;
	const nextTheme = resolveTheme(value);
	document.documentElement.classList.toggle("dark", nextTheme === "dark");
};

const applyThemeWithVT = (value: ThemeMode) => {
	if (!browser) return;

  if (!document.startViewTransition) {
    applyTheme(value);
    return;
  }

  const html = document.documentElement;
  html.classList.add("theme-vt");

	const vt = document.startViewTransition(() => {
		applyTheme(value);
	});

	vt.finished.finally(() => {
		html.classList.remove("theme-vt");
	});
};

const setTheme = (value: ThemeMode) => {
	theme = value;
	if (!browser) return;

	applyThemeWithVT(value);
	if (value === "system") {
		window.localStorage.setItem("varsel-theme", "system");
	} else {
		window.localStorage.setItem("varsel-theme", value);
	}
};

const toggleMobileNav = () => {
	isMobileNavOpen = !isMobileNavOpen;
};

const handleNavLinkClick = () => {
	if (!isDesktop) {
		isMobileNavOpen = false;
	}
};

const handleDocumentPointerDown = (event: PointerEvent) => {
	if (!isMobileNavOpen || isDesktop) return;
	if (!sidebarElement) return;
	if (!event.target || !(event.target instanceof Node)) return;

	if (!sidebarElement.contains(event.target)) {
		isMobileNavOpen = false;
	}
};

const getThemeButtonClasses = (mode: ThemeMode) =>
	cn(
		"inline-flex size-6 items-center justify-center rounded-md border transition-colors duration-150 ease-out focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-vs-ring/50",
		theme === mode
			? "bg-card text-foreground border-border shadow-sm"
			: "border-transparent text-foreground/60 hover:text-foreground",
	);

let mediaQuery: MediaQueryList | null = null;

onMount(() => {
	if (!browser) return;
	const stored = window.localStorage.getItem("varsel-theme");
	if (stored === "dark" || stored === "light" || stored === "system") {
		theme = stored;
	} else {
		theme = "system";
	}

	mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
	desktopMediaQuery = window.matchMedia("(min-width: 1024px)");

	const syncSystemPreference = (matches: boolean) => {
		systemPreference = matches ? "dark" : "light";
		if (theme === "system") {
			applyTheme("system");
		}
	};

	const syncDesktopState = (matches: boolean) => {
		isDesktop = matches;
		if (isDesktop) {
			isMobileNavOpen = false;
		}
	};

	syncSystemPreference(mediaQuery.matches);
	syncDesktopState(desktopMediaQuery.matches);

	const handlePreferenceChange = (event: MediaQueryListEvent) => {
		syncSystemPreference(event.matches);
	};

	const handleDesktopChange = (event: MediaQueryListEvent) => {
		syncDesktopState(event.matches);
	};

	mediaQuery.addEventListener("change", handlePreferenceChange);
	desktopMediaQuery.addEventListener("change", handleDesktopChange);
	applyTheme(theme);
	document.addEventListener("pointerdown", handleDocumentPointerDown);

	return () => {
		mediaQuery?.removeEventListener("change", handlePreferenceChange);
		desktopMediaQuery?.removeEventListener("change", handleDesktopChange);
		document.removeEventListener("pointerdown", handleDocumentPointerDown);
	};
});
</script>

<aside
	class="flex w-full flex-col border-b border-border bg-card p-4 fixed lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r z-50 shadow-md"
	bind:this={sidebarElement}
>
	<div class="flex items-center justify-between gap-2">
		<a href="/" class="flex items-center gap-2 px-2 text-foreground">
	    	<svg
	    		class="h-4 w-auto"
	    		viewBox="0 0 493 251"
	    		fill="none"
	    		xmlns="http://www.w3.org/2000/svg"
	    		aria-hidden="true"
	    	>
	    		<path
	    			fill-rule="evenodd"
	    			clip-rule="evenodd"
	    			d="M1.95 2.753c1.074 1.514 9.058 14.467 17.743 28.784a45664.2 45664.2 0 0 0 31.182 51.31 40042.09 40042.09 0 0 1 31.027 51.061c8.6 14.179 16.646 27.357 17.882 29.284 1.236 1.928 7.427 12.064 13.757 22.527 34.988 57.825 36.24 59.773 40.03 62.279 7.28 4.814 17.378 3.731 23.083-2.477 1.382-1.504 10.324-16.251 19.871-32.77 17.587-30.435 22.529-38.953 34.491-59.456 3.658-6.27 6.508-11.542 6.332-11.717-.174-.174-2.727.388-5.672 1.25-3.795 1.113-8.017 1.441-14.493 1.129-17.889-.863-28.416-8.43-41.324-29.705-4.214-6.948-8.676-14.209-9.915-16.136-1.237-1.928-6.749-10.938-12.247-20.024-26.982-44.585-41.796-68.846-43.63-71.451-1.111-1.578-3.868-3.709-6.127-4.734C100.114.171 96.43.042 49.917.022L0 0l1.95 2.753ZM491.049 248.247c-1.073-1.514-9.057-14.467-17.742-28.784a46899.398 46899.398 0 0 0-31.182-51.311 39420.49 39420.49 0 0 1-31.027-51.06c-8.6-14.179-16.646-27.357-17.882-29.284-1.236-1.928-7.427-12.065-13.757-22.527-34.988-57.825-36.239-59.773-40.03-62.28-7.28-4.813-17.378-3.73-23.083 2.478-1.382 1.504-10.324 16.25-19.871 32.77-17.587 30.435-22.529 38.953-34.491 59.456-3.658 6.27-6.508 11.542-6.332 11.717.174.174 2.727-.388 5.672-1.25 3.795-1.113 8.017-1.441 14.493-1.129 17.889.863 28.416 8.43 41.324 29.705 4.214 6.948 8.676 14.209 9.915 16.136 1.237 1.928 6.749 10.938 12.247 20.024 26.982 44.586 41.796 68.846 43.63 71.451 1.111 1.578 3.868 3.709 6.127 4.734 3.826 1.736 7.511 1.865 54.024 1.885L493 251l-1.951-2.753Z"
	    			fill="currentColor"
	    		/>
	    	</svg>
	    	<p class="text-lg font-medium font-mono tracking-tight">Varsel</p>
		</a>

		<button
			type="button"
			class="inline-flex size-8 items-center justify-center rounded-md border border-border text-foreground transition-colors duration-150 ease-out hover:bg-card-muted lg:hidden"
			onclick={toggleMobileNav}
			aria-label={`${isMobileNavOpen ? "Hide" : "Show"} navigation`}
			aria-expanded={isMobileNavOpen}
			aria-controls="docs-sidebar-content"
		>
			<svg
				width="15"
				height="15"
				viewBox="0 0 15 15"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z"
					fill="currentColor"
					fill-rule="evenodd"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
	</div>

		<div
			id="docs-sidebar-content"
			class={cn(
				"grid flex-1 w-full overflow-hidden transition-[grid-template-rows] duration-200 ease-out lg:mt-6 lg:block lg:grid-rows-[1fr] lg:overflow-visible",
				isMobileNavOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
			)}
		>
				<div
					class={cn(
						"flex flex-1 flex-col overflow-hidden transition-opacity duration-150 ease-out lg:h-full lg:pt-0 lg:overflow-visible lg:opacity-100 lg:pointer-events-auto",
						isMobileNavOpen ? "opacity-100" : "opacity-0 pointer-events-none",
					)}
				>
			<nav class="flex flex-1 flex-col gap-6 pt-6 lg:pt-0">
				{#each links as group}
					<div class="flex flex-col gap-1">
						<p class="px-2 text-[10px] font-medium uppercase tracking-wide text-foreground/45">
							{group.label}
						</p>
						{#each group.links as link}
							{@const isActive = currentPage.url.pathname.startsWith(link.href)}
							<a
								href={link.href}
								aria-current={isActive ? "page" : undefined}
								class={`px-2 py-1 text-left rounded-sm transition-all duration-150 ease-out hover:bg-card-muted hover:text-foreground ${isActive ? "text-foreground font-medium bg-card-muted" : "text-foreground/70"}`}
								onclick={handleNavLinkClick}
							>
								<span class="block text-sm font-normal">{link.title}</span>
							</a>
						{/each}
					</div>
				{/each}
			</nav>

			<div class="mt-4 lg:mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
				<a
					class="inline-flex p-0.5 size-6 items-center justify-center rounded-sm text-foreground/70 hover:text-foreground transition-[color] duration-150 ease-out"
					href="https://github.com/hex/varsel"
					target="_blank"
					rel="noreferrer"
					aria-label="Varsel on GitHub"
				>
			<svg
				width="18"
				height="18"
				viewBox="0 0 15 15"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<path
					d="M7.49933 0.25C3.49635 0.25 0.25 3.49593 0.25 7.50024C0.25 10.703 2.32715 13.4206 5.2081 14.3797C5.57084 14.446 5.70302 14.2222 5.70302 14.0299C5.70302 13.8576 5.69679 13.4019 5.69323 12.797C3.67661 13.235 3.25112 11.825 3.25112 11.825C2.92132 10.9874 2.44599 10.7644 2.44599 10.7644C1.78773 10.3149 2.49584 10.3238 2.49584 10.3238C3.22353 10.375 3.60629 11.0711 3.60629 11.0711C4.25298 12.1788 5.30335 11.8588 5.71638 11.6732C5.78225 11.205 5.96962 10.8854 6.17658 10.7043C4.56675 10.5209 2.87415 9.89918 2.87415 7.12104C2.87415 6.32925 3.15677 5.68257 3.62053 5.17563C3.54576 4.99226 3.29697 4.25521 3.69174 3.25691C3.69174 3.25691 4.30015 3.06196 5.68522 3.99973C6.26337 3.83906 6.8838 3.75895 7.50022 3.75583C8.1162 3.75895 8.73619 3.83906 9.31523 3.99973C10.6994 3.06196 11.3069 3.25691 11.3069 3.25691C11.7026 4.25521 11.4538 4.99226 11.3795 5.17563C11.8441 5.68257 12.1245 6.32925 12.1245 7.12104C12.1245 9.9063 10.4292 10.5192 8.81452 10.6985C9.07444 10.9224 9.30633 11.3648 9.30633 12.0413C9.30633 13.0102 9.29742 13.7922 9.29742 14.0299C9.29742 14.2239 9.42828 14.4496 9.79591 14.3788C12.6746 13.4179 14.75 10.7025 14.75 7.50024C14.75 3.49593 11.5036 0.25 7.49933 0.25Z"
					fill="currentColor"
					fill-rule="evenodd"
					clip-rule="evenodd"
				/>
			</svg>
				</a>

				<div class="inline-flex gap-1 rounded-md border border-border bg-card-muted p-0.5">
					<button
						type="button"
						class={getThemeButtonClasses("light")}
						onclick={() => setTheme("light")}
						aria-label="Use light theme"
						aria-pressed={theme === "light"}
					>
						<svg
							width="14"
							height="14"
							viewBox="0 0 15 15"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								d="M7.5 0C7.77614 0 8 0.223858 8 0.5V2.5C8 2.77614 7.77614 3 7.5 3C7.22386 3 7 2.77614 7 2.5V0.5C7 0.223858 7.22386 0 7.5 0ZM2.1967 2.1967C2.39196 2.00144 2.70854 2.00144 2.90381 2.1967L4.31802 3.61091C4.51328 3.80617 4.51328 4.12276 4.31802 4.31802C4.12276 4.51328 3.80617 4.51328 3.61091 4.31802L2.1967 2.90381C2 2.70854 2 2.39196 2.1967 2.1967ZM0.5 7C0.223858 7 0 7.22386 0 7.5C0 7.77614 0.223858 8 0.5 8H2.5C2.77614 8 3 7.77614 3 7.5C3 7.22386 2.77614 7 2.5 7H0.5ZM2.1967 12.8033C2.00144 12.608 2.00144 12.2915 2.1967 12.0962L3.61091 10.682C3.80617 10.4867 4.12276 10.4867 4.31802 10.682C4.51328 10.8772 4.51328 11.1938 4.31802 11.3891L2.90381 12.8033C2.70854 12.9986 2.39196 12.9986 2.1967 12.8033ZM12.5 7C12.2239 7 12 7.22386 12 7.5C12 7.77614 12.2239 8 12.5 8H14.5C14.7761 8 15 7.77614 15 7.5C15 7.22386 14.7761 7 14.5 7H12.5ZM10.682 4.31802C10.4867 4.12276 10.4867 3.80617 10.682 3.61091L12.0962 2.1967C12.2915 2.00144 12.608 2.00144 12.8033 2.1967C12.9986 2.39196 12.9986 2.70854 12.8033 2.90381L11.3891 4.31802C11.1938 4.51328 10.8772 4.51328 10.682 4.31802ZM8 12.5C8 12.2239 7.77614 12 7.5 12C7.22386 12 7 12.2239 7 12.5V14.5C7 14.7761 7.22386 15 7.5 15C7.77614 15 8 14.7761 8 14.5V12.5ZM10.682 10.682C10.8772 10.4867 11.1938 10.4867 11.3891 10.682L12.8033 12.0962C12.9986 12.2915 12.9986 12.608 12.8033 12.8033C12.608 12.9986 12.2915 12.9986 12.0962 12.8033L10.682 11.3891C10.4867 11.1938 10.4867 10.8772 10.682 10.682ZM5.5 7.5C5.5 6.39543 6.39543 5.5 7.5 5.5C8.60457 5.5 9.5 6.39543 9.5 7.5C9.5 8.60457 8.60457 9.5 7.5 9.5C6.39543 9.5 5.5 8.60457 5.5 7.5ZM7.5 4.5C5.84315 4.5 4.5 5.84315 4.5 7.5C4.5 9.15685 5.84315 10.5 7.5 10.5C9.15685 10.5 10.5 9.15685 10.5 7.5C10.5 5.84315 9.15685 4.5 7.5 4.5Z"
								fill="currentColor"
								fill-rule="evenodd"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
					<button
						type="button"
						class={getThemeButtonClasses("system")}
						onclick={() => setTheme("system")}
						aria-label="Use system theme"
						aria-pressed={theme === "system"}
					>
						<svg
							width="15"
							height="15"
							viewBox="0 0 15 15"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								d="M7.07926 0.222253C7.31275 -0.007434 7.6873 -0.007434 7.92079 0.222253L14.6708 6.86227C14.907 7.09465 14.9101 7.47453 14.6778 7.71076C14.4454 7.947 14.0655 7.95012 13.8293 7.71773L13 6.90201V12.5C13 12.7761 12.7762 13 12.5 13H2.50002C2.22388 13 2.00002 12.7761 2.00002 12.5V6.90201L1.17079 7.71773C0.934558 7.95012 0.554672 7.947 0.32229 7.71076C0.0899079 7.47453 0.0930283 7.09465 0.32926 6.86227L7.07926 0.222253ZM7.50002 1.49163L12 5.91831V12H10V8.49999C10 8.22385 9.77617 7.99999 9.50002 7.99999H6.50002C6.22388 7.99999 6.00002 8.22385 6.00002 8.49999V12H3.00002V5.91831L7.50002 1.49163ZM7.00002 12H9.00002V8.99999H7.00002V12Z"
								fill="currentColor"
								fill-rule="evenodd"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
					<button
						type="button"
						class={getThemeButtonClasses("dark")}
						onclick={() => setTheme("dark")}
						aria-label="Use dark theme"
						aria-pressed={theme === "dark"}
					>
						<svg
							width="15"
							height="15"
							viewBox="0 0 15 15"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							aria-hidden="true"
						>
							<path
								d="M2.89998 0.499976C2.89998 0.279062 2.72089 0.0999756 2.49998 0.0999756C2.27906 0.0999756 2.09998 0.279062 2.09998 0.499976V1.09998H1.49998C1.27906 1.09998 1.09998 1.27906 1.09998 1.49998C1.09998 1.72089 1.27906 1.89998 1.49998 1.89998H2.09998V2.49998C2.09998 2.72089 2.27906 2.89998 2.49998 2.89998C2.72089 2.89998 2.89998 2.72089 2.89998 2.49998V1.89998H3.49998C3.72089 1.89998 3.89998 1.72089 3.89998 1.49998C3.89998 1.27906 3.72089 1.09998 3.49998 1.09998H2.89998V0.499976ZM5.89998 3.49998C5.89998 3.27906 5.72089 3.09998 5.49998 3.09998C5.27906 3.09998 5.09998 3.27906 5.09998 3.49998V4.09998H4.49998C4.27906 4.09998 4.09998 4.27906 4.09998 4.49998C4.09998 4.72089 4.27906 4.89998 4.49998 4.89998H5.09998V5.49998C5.09998 5.72089 5.27906 5.89998 5.49998 5.89998C5.72089 5.89998 5.89998 5.72089 5.89998 5.49998V4.89998H6.49998C6.72089 4.89998 6.89998 4.72089 6.89998 4.49998C6.89998 4.27906 6.72089 4.09998 6.49998 4.09998H5.89998V3.49998ZM1.89998 6.49998C1.89998 6.27906 1.72089 6.09998 1.49998 6.09998C1.27906 6.09998 1.09998 6.27906 1.09998 6.49998V7.09998H0.499976C0.279062 7.09998 0.0999756 7.27906 0.0999756 7.49998C0.0999756 7.72089 0.279062 7.89998 0.499976 7.89998H1.09998V8.49998C1.09998 8.72089 1.27906 8.89997 1.49998 8.89997C1.72089 8.89997 1.89998 8.72089 1.89998 8.49998V7.89998H2.49998C2.72089 7.89998 2.89998 7.72089 2.89998 7.49998C2.89998 7.27906 2.72089 7.09998 2.49998 7.09998H1.89998V6.49998ZM8.54406 0.98184L8.24618 0.941586C8.03275 0.917676 7.90692 1.1655 8.02936 1.34194C8.17013 1.54479 8.29981 1.75592 8.41754 1.97445C8.91878 2.90485 9.20322 3.96932 9.20322 5.10022C9.20322 8.37201 6.82247 11.0878 3.69887 11.6097C3.45736 11.65 3.20988 11.6772 2.96008 11.6906C2.74563 11.702 2.62729 11.9535 2.77721 12.1072C2.84551 12.1773 2.91535 12.2458 2.98667 12.3128L3.05883 12.3795L3.31883 12.6045L3.50684 12.7532L3.62796 12.8433L3.81491 12.9742L3.99079 13.089C4.11175 13.1651 4.23536 13.2375 4.36157 13.3059L4.62496 13.4412L4.88553 13.5607L5.18837 13.6828L5.43169 13.7686C5.56564 13.8128 5.70149 13.8529 5.83857 13.8885C5.94262 13.9155 6.04767 13.9401 6.15405 13.9622C6.27993 13.9883 6.40713 14.0109 6.53544 14.0298L6.85241 14.0685L7.11934 14.0892C7.24637 14.0965 7.37436 14.1002 7.50322 14.1002C11.1483 14.1002 14.1032 11.1453 14.1032 7.50023C14.1032 7.25044 14.0893 7.00389 14.0623 6.76131L14.0255 6.48407C13.991 6.26083 13.9453 6.04129 13.8891 5.82642C13.8213 5.56709 13.7382 5.31398 13.6409 5.06881L13.5279 4.80132L13.4507 4.63542L13.3766 4.48666C13.2178 4.17773 13.0353 3.88295 12.8312 3.60423L12.6782 3.40352L12.4793 3.16432L12.3157 2.98361L12.1961 2.85951L12.0355 2.70246L11.8134 2.50184L11.4925 2.24191L11.2483 2.06498L10.9562 1.87446L10.6346 1.68894L10.3073 1.52378L10.1938 1.47176L9.95488 1.3706L9.67791 1.2669L9.42566 1.1846L9.10075 1.09489L8.83599 1.03486L8.54406 0.98184ZM10.4032 5.30023C10.4032 4.27588 10.2002 3.29829 9.83244 2.40604C11.7623 3.28995 13.1032 5.23862 13.1032 7.50023C13.1032 10.593 10.596 13.1002 7.50322 13.1002C6.63646 13.1002 5.81597 12.9036 5.08355 12.5522C6.5419 12.0941 7.81081 11.2082 8.74322 10.0416C8.87963 10.2284 9.10028 10.3497 9.34928 10.3497C9.76349 10.3497 10.0993 10.0139 10.0993 9.59971C10.0993 9.24256 9.84965 8.94373 9.51535 8.86816C9.57741 8.75165 9.63653 8.63334 9.6926 8.51332C9.88358 8.63163 10.1088 8.69993 10.35 8.69993C11.0403 8.69993 11.6 8.14028 11.6 7.44993C11.6 6.75976 11.0406 6.20024 10.3505 6.19993C10.3853 5.90487 10.4032 5.60464 10.4032 5.30023Z"
								fill="currentColor"
								fill-rule="evenodd"
								clip-rule="evenodd"
							/>
						</svg>
					</button>
				</div>
			</div>
		</div>
		</div>
</aside>
