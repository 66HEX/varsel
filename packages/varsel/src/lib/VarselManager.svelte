<script lang="ts">
import { onMount } from "svelte";
import VarselItem from "./VarselItem.svelte";
import {
	ANIMATION_CONFIG,
	type PositionedToast,
	type ToastData,
	type ToastPosition,
} from "./internals";

export let toasts: ToastData[] = [];
export let onRemove: (id: string) => void;
export let expandedGap: number = ANIMATION_CONFIG.EXPANDED_GAP;

const createPositionMap = <T>(value: () => T): Record<ToastPosition, T> => ({
	"top-left": value(),
	"top-center": value(),
	"top-right": value(),
	"bottom-left": value(),
	"bottom-center": value(),
	"bottom-right": value(),
});

let heights: Record<string, number> = {};
let hovered: Record<ToastPosition, boolean> = createPositionMap(() => false);
let previousStackIndex: Record<string, number> = {};
let previousCollapsedOffsets: Record<string, number> = {};
let previousExpandedOffsets: Record<string, number> = {};
let toastsByPosition: Record<ToastPosition, PositionedToast[]> =
	createPositionMap<PositionedToast[]>(() => []);
let positionEntries: [ToastPosition, PositionedToast[]][] = [];
let collapsedOffsetData: {
	byPosition: Record<ToastPosition, number[]>;
	byId: Record<string, number>;
} = { byPosition: createPositionMap<number[]>(() => []), byId: {} };
let expandedOffsetData: {
	byPosition: Record<ToastPosition, number[]>;
	byId: Record<string, number>;
} = { byPosition: createPositionMap<number[]>(() => []), byId: {} };

let latestPositionEntries: [ToastPosition, PositionedToast[]][] = [];
let latestHovered: Record<ToastPosition, boolean> = hovered;

$: latestPositionEntries = positionEntries;
$: latestHovered = hovered;

$: {
	const grouped = createPositionMap<ToastData[]>(() => []);
	for (const toast of toasts) {
		const pos = toast.position || "bottom-center";
		grouped[pos].push(toast);
	}

	const nextStackIndices: Record<string, number> = {};
	const positioned = createPositionMap<PositionedToast[]>(() => []);

	for (const position of Object.keys(grouped) as ToastPosition[]) {
		const list = grouped[position];
		const activeToasts = list.filter(
			(toast) => !toast.isLeaving && !toast.shouldClose,
		);
		const activeIndexMap = new Map<string, number>();
		activeToasts.forEach((toast, activeIndex) => {
			activeIndexMap.set(toast.id, activeIndex);
		});

		positioned[position] = list.map((toast, orderIndex) => {
			let stackIndex =
				activeIndexMap.get(toast.id) ?? previousStackIndex[toast.id];
			if (stackIndex == null || Number.isNaN(stackIndex)) {
				stackIndex = orderIndex;
			}

			nextStackIndices[toast.id] = stackIndex;

			return {
				...toast,
				index: stackIndex,
				renderIndex: orderIndex,
				total: list.length,
			};
		}) as PositionedToast[];
	}

	previousStackIndex = nextStackIndices;
	toastsByPosition = positioned;
}

$: {
	const next = { ...hovered };
	let changed = false;
	for (const pos of Object.keys(hovered) as ToastPosition[]) {
		const hasToast = (toastsByPosition[pos]?.length ?? 0) > 0;
		if (!hasToast && next[pos]) {
			next[pos] = false;
			changed = true;
		}
	}
	if (changed) {
		hovered = next;
	}
}

$: positionEntries = Object.entries(toastsByPosition) as [
	ToastPosition,
	PositionedToast[],
][];

$: collapsedOffsetData = (() => {
	const byPosition = createPositionMap<number[]>(() => []);
	const byId: Record<string, number> = {};

	for (const [pos, group] of positionEntries) {
		const isTopPosition = pos.startsWith("top-");
		const activeToasts = group.filter((toast) => !toast.shouldClose);
		const offsetsForActive: number[] = [];

		for (let i = 0; i < activeToasts.length; i++) {
			if (i === 0) {
				offsetsForActive.push(0);
				continue;
			}

			const prevToast = activeToasts[i - 1];
			const currentToast = activeToasts[i];
			const prevOffset = offsetsForActive[i - 1] ?? 0;
			if (!prevToast || !currentToast) {
				offsetsForActive.push(prevOffset);
				continue;
			}
			const prevHeight = heights[prevToast.id];
			const currentHeight = heights[currentToast.id];
			const fallbackOffset =
				prevOffset + (isTopPosition ? 1 : -1) * ANIMATION_CONFIG.STACK_OFFSET;

			if (
				prevHeight == null ||
				currentHeight == null ||
				Number.isNaN(prevHeight) ||
				Number.isNaN(currentHeight)
			) {
				offsetsForActive.push(fallbackOffset);
				continue;
			}

			if (isTopPosition) {
				offsetsForActive.push(
					prevOffset +
						(prevHeight - currentHeight + ANIMATION_CONFIG.STACK_OFFSET),
				);
			} else {
				offsetsForActive.push(
					prevOffset +
						(currentHeight - prevHeight - ANIMATION_CONFIG.STACK_OFFSET),
				);
			}
		}

		for (let i = 0; i < activeToasts.length; i++) {
			const toast = activeToasts[i];
			if (!toast) continue;
			byId[toast.id] = offsetsForActive[i] ?? 0;
		}

		for (const toast of group) {
			if (byId[toast.id] != null) continue;
			const previousOffset = previousCollapsedOffsets[toast.id];
			if (typeof previousOffset === "number") {
				byId[toast.id] = previousOffset;
				continue;
			}

			const defaultOffset = isTopPosition
				? toast.index * ANIMATION_CONFIG.STACK_OFFSET
				: -(toast.index * ANIMATION_CONFIG.STACK_OFFSET);
			byId[toast.id] = defaultOffset;
		}

		byPosition[pos] = group.map((toast) => byId[toast.id] ?? 0);
	}

	previousCollapsedOffsets = byId;
	return { byPosition, byId };
})();

$: expandedOffsetData = (() => {
	const byPosition = createPositionMap<number[]>(() => []);
	const byId: Record<string, number> = {};

	for (const [pos, group] of positionEntries) {
		const offsets: number[] = [];
		const activeToasts = group.filter((toast) => !toast.shouldClose);
		let acc = 0;

		for (let i = 0; i < activeToasts.length; i++) {
			if (i === 0) {
				offsets.push(0);
				continue;
			}
			const prevToast = activeToasts[i - 1];
			const prevHeight = prevToast ? (heights[prevToast.id] ?? 0) : 0;
			acc += prevHeight + expandedGap;
			offsets.push(acc);
		}

		for (let i = 0; i < activeToasts.length; i++) {
			const toast = activeToasts[i];
			if (!toast) continue;
			byId[toast.id] = offsets[i] ?? 0;
		}

		for (const toast of group) {
			if (byId[toast.id] != null) continue;

			const previousOffset = previousExpandedOffsets[toast.id];
			if (typeof previousOffset === "number") {
				byId[toast.id] = previousOffset;
				continue;
			}

			let fallback = 0;
			for (const candidate of group) {
				if (candidate.id === toast.id) break;
				const height = heights[candidate.id] ?? 0;
				fallback += height + expandedGap;
			}
			byId[toast.id] = fallback;
		}

		byPosition[pos] = group.map((toast) => byId[toast.id] ?? 0);
	}

	previousExpandedOffsets = byId;
	return { byPosition, byId };
})();

onMount(() => {
	const handleMouseMove = (event: MouseEvent) => {
		if (latestPositionEntries.length === 0) return;
		const { clientX: x, clientY: y } = event;
		const next: Record<ToastPosition, boolean> = {
			...latestHovered,
		};
		for (const [pos, group] of latestPositionEntries) {
			let top = Number.POSITIVE_INFINITY;
			let left = Number.POSITIVE_INFINITY;
			let right = Number.NEGATIVE_INFINITY;
			let bottom = Number.NEGATIVE_INFINITY;
			let any = false;
			for (const t of group) {
				if (t.index >= ANIMATION_CONFIG.MAX_VISIBLE_TOASTS) continue;
				const el = document.querySelector(
					`[data-toast-id="${t.id}"]`,
				) as HTMLElement | null;
				if (!el) continue;
				const rect = el.getBoundingClientRect();
				top = Math.min(top, rect.top);
				left = Math.min(left, rect.left);
				right = Math.max(right, rect.right);
				bottom = Math.max(bottom, rect.bottom);
				any = true;
			}

			if (!any) {
				next[pos] = false;
				continue;
			}

			const inside = x >= left && x <= right && y >= top && y <= bottom;
			next[pos] = inside;
		}

		const changed = (Object.keys(next) as ToastPosition[]).some(
			(key) => next[key] !== hovered[key],
		);
		if (changed) {
			hovered = next;
		}
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key !== "Escape") return;
		for (const [, group] of latestPositionEntries) {
			const latestToast = group?.[0];
			if (!latestToast) continue;
			const container = document.querySelector(
				`[data-toast-id="${latestToast.id}"]`,
			) as HTMLElement | null;
			if (!container) continue;
			const active = document.activeElement as HTMLElement | null;
			if (active && container.contains(active)) {
				const closeBtn = container.querySelector(
					'[aria-label="Close toast"]',
				) as HTMLButtonElement | null;
				if (closeBtn) {
					event.preventDefault();
					closeBtn.click();
				}
			}
		}
	};

	document.addEventListener("mousemove", handleMouseMove);
	document.addEventListener("keydown", handleKeyDown);
	return () => {
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("keydown", handleKeyDown);
	};
});

const handleHeightChange = (id: string, height: number) => {
	if (heights[id] === height) return;
	heights = { ...heights, [id]: height };
};
</script>

{#if toasts.length > 0}
	<div class="pointer-events-none fixed inset-0 z-50">
		{#each positionEntries as [position, positionToasts]}
			{@const pos = position}
			{@const expandedOffsets = expandedOffsetData.byPosition[pos]}
			{@const collapsedOffsets = collapsedOffsetData.byPosition[pos]}
			{@const isHovered = hovered[pos]}
			{@const activeToasts = positionToasts.filter((toast) => !toast.shouldClose)}
			{@const visibleStackLimit = Math.max(ANIMATION_CONFIG.MAX_VISIBLE_TOASTS - 1, 0)}
			{@const maxVisibleStackIndex = Math.min(
				Math.max(activeToasts.length - 1, 0),
				visibleStackLimit,
			)}
			{@const lastVisibleToastId = activeToasts[maxVisibleStackIndex]?.id}
			{@const lastVisibleRenderIndex = lastVisibleToastId != null
				? positionToasts.findIndex(
						(candidate) => candidate.id === lastVisibleToastId,
					)
				: -1}
			{@const sharedHiddenCollapsedOffset =
				lastVisibleRenderIndex >= 0
					? collapsedOffsets?.[lastVisibleRenderIndex]
					: undefined}
			{#each positionToasts as toast, idx (toast.id)}
				{@const toastIsHidden =
					toast.index >= ANIMATION_CONFIG.MAX_VISIBLE_TOASTS}
				{@const hiddenCollapsedOffset = toastIsHidden
					? sharedHiddenCollapsedOffset ?? collapsedOffsets?.[idx]
					: collapsedOffsets?.[idx]}
				{@const collapsedOffsetValue = collapsedOffsets?.[idx]}
				<VarselItem
					{toast}
					{onRemove}
					isGroupHovered={isHovered}
					expandedOffset={expandedOffsets?.[idx] ?? 0}
					{expandedGap}
					onHeightChange={handleHeightChange}
					onGroupHoverEnter={() => {
						hovered = { ...hovered, [pos]: true };
					}}
					collapsedOffset={collapsedOffsetValue}
					hiddenCollapsedOffset={hiddenCollapsedOffset}
				/>
			{/each}
		{/each}
	</div>
{/if}
