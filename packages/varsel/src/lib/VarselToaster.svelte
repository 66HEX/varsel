<script lang="ts" module>
export {
	toast,
	type ToastData,
	type ToastInvoker,
	type ToastPosition,
} from "./internals";
</script>

<script lang="ts">
	import VarselManager from './VarselManager.svelte';
	import {
		toastState,
		toasterInstanceManager,
		type ToastData,
	} from './internals';

	let { expandedGap = undefined }: { expandedGap?: number } = $props();

	let toasts = $state<ToastData[]>([]);
	const instanceId = toasterInstanceManager.registerInstance();

	const handleRemove = (id: string) => {
		toastState.remove(id);
	};

	$effect(() => {
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