<script lang="ts">
	import { toast as varselToast } from "varsel";
	import type { PositionedToast } from "varsel";

	let {
		id,
		title,
		description,
		button,
	}: {
		id: string;
		title: string;
		description: string;
		button: { label: string; onClick: () => void };
		toast: PositionedToast;
	} = $props();
</script>

<div
	class="flex w-full max-w-[364px] items-center rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5 dark:bg-zinc-900 dark:ring-white/10"
>
	<div class="flex flex-1 items-center">
		<div class="w-full">
			<p class="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
			<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
		</div>
	</div>
	<div
		class="ml-5 shrink-0 rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-hidden dark:text-indigo-400 dark:hover:text-indigo-300"
	>
		<button
			class="cursor-pointer rounded bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
			onclick={() => {
				button.onClick();
				varselToast.dismiss(id);
			}}
		>
			{button.label}
		</button>
	</div>
</div>
