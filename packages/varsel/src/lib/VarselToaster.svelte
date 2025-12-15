<script lang="ts" module>
/**
 * Main module exports for the Varsel library.
 */
export {
	toast,
	type ToastData,
	type ToastInvoker,
	type ToastPosition,
} from "./internals";
</script>

<script lang="ts">
	/**
	 * @component
	 * @description
	 * The root component for the Varsel notification system.
	 * It subscribes to the global toast state and renders the `VarselManager`
	 * which handles the positioning and layout of individual toasts.
	 *
	 * Place this component once in your application's root layout (e.g., `+layout.svelte`).
	 */
	import VarselManager from './VarselManager.svelte';
	import {
		toastState,
		toasterInstanceManager,
		type ToastData,
	} from './internals';

	let { expandedGap = undefined }: { 
		/**
		 * The gap (in pixels) between expanded toasts when hovering over the stack.
		 * If undefined, uses the default value from animation config.
		 */
		expandedGap?: number 
	} = $props();

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
