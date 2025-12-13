<script lang="ts">
	import type { VarselToastOptions } from './types';

	export let options: VarselToastOptions = {
		position: 'top-right',
		max: 3
	};

	export { type VarselToastOptions } from './types';
</script>

<div class="varsel-toaster" data-position={options.position}>
	<slot />
</div>

<style>
	.varsel-toaster {
		position: fixed;
		inset: 1.5rem;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.varsel-toaster[data-position='top-right'] {
		align-items: flex-end;
	}
</style>
