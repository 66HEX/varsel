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
		type ToastPosition,
	} from './internals';

	let { 
		expandedGap = undefined,
		position = 'bottom-center',
		visibleToasts = 3,
		expand = true,
		duration = 5000,
		closeButton = true,
		pauseOnHover = true,
		offset = undefined,
		dir = 'auto'
	}: { 
		/**
		 * The gap (in pixels) between expanded toasts when hovering over the stack.
		 * If undefined, uses the default value from animation config.
		 */
		expandedGap?: number;
		/** Default position for toasts. */
		position?: ToastPosition;
		/** Maximum number of visible toasts in the stack. */
		visibleToasts?: number;
		/** Whether to expand the stack on hover. */
		expand?: boolean;
		/** Default duration in milliseconds. */
		duration?: number;
		/** Whether to show the close button by default. */
		closeButton?: boolean;
		/** Whether to pause the timer on hover. */
		pauseOnHover?: boolean;
		/** Offset from the edge of the screen. */
		offset?: number | string;
		/** Directionality of the text. */
		dir?: 'ltr' | 'rtl' | 'auto';
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
	<VarselManager 
		{toasts} 
		onRemove={handleRemove} 
		{expandedGap}
		{position}
		{visibleToasts}
		{expand}
		{duration}
		{closeButton}
		{pauseOnHover}
		{offset}
		{dir}
	/>
{/if}
