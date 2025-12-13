<script lang="ts">
	import { VarselToaster } from '@varsel/svelte';
</script>

<main class="hero">
	<section>
		<h1>Varsel</h1>
		<p class="lede">
			Svelte-native toast system inspired by Sonner. This page is wired to the workspace package so
			you can iterate on components and documentation side by side.
		</p>
	</section>

	<VarselToaster />
</main>

<style>
	.hero {
		min-height: 100vh;
		display: grid;
		gap: 2rem;
		align-content: center;
	}

	.lede {
		font-size: 1.1rem;
		color: hsl(0 0% 40%);
	}
</style>
