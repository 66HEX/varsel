<script lang="ts" context="module">
export {
	toast,
	type ToastData,
	type ToastInvoker,
	type ToastPosition,
} from "./internals";
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import VarselManager from './VarselManager.svelte';
	import {
		toastState,
		toasterInstanceManager,
		type ToastData,
	} from './internals';

	export let expandedGap: number | undefined = undefined;

	let toasts: ToastData[] = [];
	const instanceId = toasterInstanceManager.registerInstance();

	const handleRemove = (id: string) => {
		toastState.remove(id);
	};

	onMount(() => {
		toasts = toastState.getToasts();
		const unsubscribe = toastState.subscribe((value) => {
			toasts = value;
		});
		return () => {
			unsubscribe();
			toasterInstanceManager.unregisterInstance(instanceId);
		};
	});
</script>

{#if toasterInstanceManager.isActiveInstance(instanceId)}
	{#if expandedGap === undefined}
		<VarselManager {toasts} onRemove={handleRemove} />
	{:else}
		<VarselManager {toasts} onRemove={handleRemove} {expandedGap} />
	{/if}
{/if}
