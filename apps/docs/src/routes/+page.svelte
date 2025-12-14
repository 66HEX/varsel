<main style="view-transition-name: homepage-content" class="h-screen w-screen flex flex-col gap-8 items-center justify-center bg-background px-4">
	<div class="flex flex-col gap-4 max-w-2xl text-center">
		<div class="relative flex items-center justify-center">
			<svg
				class="pointer-events-none absolute inset-x-0 -top-16 mx-auto h-55 w-auto"
				viewBox="-10 -10 513 272"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				aria-hidden="true"
			>
				<defs>
					<linearGradient
						id="homepage-logo-gradient"
						x1="0%"
						y1="0%"
						x2="100%"
						y2="100%"
					>
						<stop offset="0%" stop-color="var(--logo-gradient-start)" />
						<stop offset="100%" stop-color="var(--logo-gradient-end)" />
					</linearGradient>
				</defs>
				<path
					fill-rule="evenodd"
					clip-rule="evenodd"
					d="M1.95 2.753c1.074 1.514 9.058 14.467 17.743 28.784a45664.2 45664.2 0 0 0 31.182 51.31 40042.09 40042.09 0 0 1 31.027 51.061c8.6 14.179 16.646 27.357 17.882 29.284 1.236 1.928 7.427 12.064 13.757 22.527 34.988 57.825 36.24 59.773 40.03 62.279 7.28 4.814 17.378 3.731 23.083-2.477 1.382-1.504 10.324-16.251 19.871-32.77 17.587-30.435 22.529-38.953 34.491-59.456 3.658-6.27 6.508-11.542 6.332-11.717-.174-.174-2.727.388-5.672 1.25-3.795 1.113-8.017 1.441-14.493 1.129-17.889-.863-28.416-8.43-41.324-29.705-4.214-6.948-8.676-14.209-9.915-16.136-1.237-1.928-6.749-10.938-12.247-20.024-26.982-44.585-41.796-68.846-43.63-71.451-1.111-1.578-3.868-3.709-6.127-4.734C100.114.171 96.43.042 49.917.022L0 0l1.95 2.753ZM491.049 248.247c-1.073-1.514-9.057-14.467-17.742-28.784a46899.398 46899.398 0 0 0-31.182-51.311 39420.49 39420.49 0 0 1-31.027-51.06c-8.6-14.179-16.646-27.357-17.882-29.284-1.236-1.928-7.427-12.065-13.757-22.527-34.988-57.825-36.239-59.773-40.03-62.28-7.28-4.813-17.378-3.73-23.083 2.478-1.382 1.504-10.324 16.25-19.871 32.77-17.587 30.435-22.529 38.953-34.491 59.456-3.658 6.27-6.508 11.542-6.332 11.717.174.174 2.727-.388 5.672-1.25 3.795-1.113 8.017-1.441 14.493-1.129 17.889.863 28.416 8.43 41.324 29.705 4.214 6.948 8.676 14.209 9.915 16.136 1.237 1.928 6.749 10.938 12.247 20.024 26.982 44.586 41.796 68.846 43.63 71.451 1.111 1.578 3.868 3.709 6.127 4.734 3.826 1.736 7.511 1.865 54.024 1.885L493 251l-1.951-2.753Z"
					fill="url(#homepage-logo-gradient)"
					stroke="var(--logo-stroke-color)"
					stroke-width="1"
					stroke-linejoin="round"
				/>
			</svg>

			<h1 class="relative z-10 text-9xl text-foreground tracking-tight font-medium font-mono">
				Varsel
			</h1>
		</div>
		<p class="text-2xl text-vs-foreground/70 leading-relaxed font-light">
			Svelte-native toast system inspired by Sonner.
		</p>
	</div>
	<div class="flex flex-wrap items-center justify-center gap-4">
		<a
			class="inline-flex h-9 items-center rounded-md bg-foreground px-8 text-sm font-medium text-foreground-invert shadow-sm hover:bg-foreground/80 transition-[background-color,scale] duration-150 ease-out active:scale-[0.975]"
			href="/docs/overview"
		>
		    Documentation
		</a>
		<a
			class="inline-flex h-9 items-center rounded-md bg-card border border-border px-8 text-sm font-medium text-foreground hover:bg-card-muted shadow-sm transition-[background-color,scale] duration-150 ease-out active:scale-[0.975]"
			href="https://github.com/hex/varsel"
			target="_blank"
			rel="noreferrer"
		>
		    GitHub
		</a>
	</div>
</main>

<style>
	:global(:root) {
		--logo-gradient-start: #dbdcdc;
		--logo-gradient-end: #ffffff;
		--logo-stroke-color: #dbdcdc;
	}

	:global(.dark) {
		--logo-gradient-start: #25282E;
		--logo-gradient-end: #0B0D0F;
		--logo-stroke-color: #25282E;
	}
</style>
