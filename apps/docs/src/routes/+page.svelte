<script lang="ts">
import logoMark from "$lib/assets/vector.png";
</script>

<main style="view-transition-name: homepage-content" class="h-screen w-screen flex flex-col gap-8 items-center justify-center bg-background px-4">
	<div class="flex flex-col gap-4 max-w-2xl text-center">
		<div class="relative flex items-center justify-center">
			<img
				src={logoMark}
				alt="Varsel Logo"
				class="pointer-events-none absolute inset-x-0 -top-16 mx-auto h-55 w-auto"
				aria-hidden="true"
			/>
			<h1 class="relative z-10 text-9xl text-foreground tracking-tight font-medium">
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
