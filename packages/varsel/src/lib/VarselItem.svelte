<script lang="ts">
import { onDestroy, onMount } from "svelte";
import {
	ANIMATION_CONFIG,
	FOCUSABLE_SELECTORS,
	POSITION_CONFIGS,
	SWIPE_DISMISS_THRESHOLD,
	SWIPE_DISMISS_VELOCITY,
	SWIPE_EXIT_DISTANCE,
	cn,
	getDefaultSwipeDirections,
	toastContainerVariants,
	toastContentVariants,
	toastState,
	type PositionedToast,
	type ToastPosition,
	type SwipeAxis,
	type SwipeDirection,
} from "./internals";

export let toast: PositionedToast;
export let onRemove: (id: string) => void;
export let isGroupHovered = false;
export let expandedOffset = 0;
export let expandedGap: number = ANIMATION_CONFIG.EXPANDED_GAP;
export let collapsedOffset: number | undefined = undefined;
export let hiddenCollapsedOffset: number | undefined = undefined;
export let onHeightChange: ((id: string, height: number) => void) | undefined =
	undefined;
export let onGroupHoverEnter: (() => void) | undefined = undefined;
export let onGroupHoldChange:
	| ((holding: boolean) => void)
	| undefined = undefined;

let toastRef: HTMLDivElement | null = null;
let isItemHovered = false;
let isSwiping = false;
let swipeDismissDirection: SwipeDirection | null = null;
let animationState: "entering" | "entered" | "exiting" | "stacking" =
	"entering";

let timeoutRef: ReturnType<typeof setTimeout> | null = null;
let timerStartRef: number | null = null;
let remainingTime: number | null = Number.NaN;
let enterAnimationFrame: number | null = null;
let focusTimeout: ReturnType<typeof setTimeout> | null = null;
let pointerStart: { x: number; y: number } | null = null;
let dragStartTime: number | null = null;
let swipeAxis: SwipeAxis | null = null;
let lastSwipe = { x: 0, y: 0 };
let resizeCleanup: (() => void) | null = null;
let mounted = false;
let prevShouldClose = false;
let previousDuration: number | undefined;
let isExiting = false;
let exitAnimationComplete = false;
let hasAnimatedIn = false;
let isPointerHeld = false;

let id: string;
let title: string | undefined;
let description: string | undefined;
let variant: PositionedToast["variant"];
let duration: number;
let action: PositionedToast["action"];
let index: number;
let renderIndex: number;
let shouldClose: boolean | undefined;
let position: PositionedToast["position"];
let className: string | undefined;
let onClose: (() => void) | undefined;

$: ({
	id,
	title,
	description,
	variant = "default",
	duration = 5000,
	action,
	index,
	renderIndex,
	shouldClose,
	position = "bottom-center",
	className = "",
	onClose,
} = toast);

const clearSwipeRefs = () => {
	pointerStart = null;
	dragStartTime = null;
	swipeAxis = null;
	lastSwipe = { x: 0, y: 0 };
};

const getFocusableElements = () => {
	if (!toastRef) return [];
	return Array.from(
		toastRef.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
	);
};

const handleTransitionEnd = (event: TransitionEvent) => {
	if (event.target !== toastRef) return;
	if (event.propertyName !== "opacity" && event.propertyName !== "transform")
		return;
	if (animationState !== "exiting") return;
	if (exitAnimationComplete) return;

	exitAnimationComplete = true;
	onClose?.();
	onRemove(id);
};

const handleClose = () => {
	if (!toastRef || isExiting) return;

	isExiting = true;
	exitAnimationComplete = false;

	toastState.update(id, { shouldClose: true });

	if (enterAnimationFrame) {
		cancelAnimationFrame(enterAnimationFrame);
		enterAnimationFrame = null;
	}

	if (timeoutRef) {
		clearTimeout(timeoutRef);
		timeoutRef = null;
	}

	animationState = "exiting";
	toastState.update(id, { shouldClose: true, isLeaving: true });
};

$: {
	const desiredClose = Boolean(shouldClose);
	if (desiredClose && !prevShouldClose) {
		handleClose();
	}
	prevShouldClose = desiredClose;
}

onMount(() => {
	mounted = true;
	return () => {
		mounted = false;
		if (enterAnimationFrame) cancelAnimationFrame(enterAnimationFrame);
		if (timeoutRef) clearTimeout(timeoutRef);
		if (focusTimeout) clearTimeout(focusTimeout);
		resizeCleanup?.();
	};
});

onDestroy(() => {
	if (enterAnimationFrame) cancelAnimationFrame(enterAnimationFrame);
	if (timeoutRef) clearTimeout(timeoutRef);
	if (focusTimeout) clearTimeout(focusTimeout);
	resizeCleanup?.();
	if (isPointerHeld) {
		isPointerHeld = false;
		onGroupHoldChange?.(false);
	}
});

$: if (mounted && duration !== previousDuration) {
	remainingTime = duration;
	previousDuration = duration;
}

$: if (mounted) {
	resizeCleanup?.();
	if (!toastRef || !onHeightChange) {
		resizeCleanup = null;
	} else {
		const el = toastRef;
		const notify = () => onHeightChange?.(id, el.offsetHeight);
		const ro = new ResizeObserver(() => notify());
		ro.observe(el);
		notify();
		resizeCleanup = () => ro.disconnect();
	}
}

const setFocusToToast = () => {
	if (!toastRef) return;
	const focusableElements = getFocusableElements();
	const firstFocusable = focusableElements[0];
	if (firstFocusable) {
		firstFocusable.focus();
		return;
	}
	toastRef.focus();
};

$: if (mounted && toastRef && !isExiting) {
	if (!hasAnimatedIn && isLatest) {
		hasAnimatedIn = true;
		animationState = "entering";
		if (enterAnimationFrame) {
			cancelAnimationFrame(enterAnimationFrame);
		}
		enterAnimationFrame = requestAnimationFrame(() => {
			enterAnimationFrame = requestAnimationFrame(() => {
				animationState = "entered";
				if (action) {
					if (focusTimeout) clearTimeout(focusTimeout);
					focusTimeout = setTimeout(
						() => setFocusToToast(),
						ANIMATION_CONFIG.ENTER_DURATION * 1000,
					);
				}
			});
		});
	} else if (hasAnimatedIn) {
		if (animationState !== "stacking" || index > 0) {
			animationState = "stacking";
		}
	} else {
		animationState = "stacking";
	}
}

$: if (mounted) {
	if (shouldClose || !hasAnimatedIn || duration <= 0) {
		if (timeoutRef) {
			clearTimeout(timeoutRef);
			timeoutRef = null;
		}
		timerStartRef = null;
	} else {
		if (remainingTime == null || Number.isNaN(remainingTime)) {
			remainingTime = duration;
		}

		const isPaused =
			isGroupHovered || isItemHovered || isSwiping || hiddenByStacking;

		if (isPaused) {
			if (timeoutRef) {
				clearTimeout(timeoutRef);
				timeoutRef = null;
			}
			if (timerStartRef !== null) {
				const elapsed = Date.now() - timerStartRef;
				remainingTime = Math.max(0, (remainingTime ?? duration) - elapsed);
				timerStartRef = null;
			}
		} else {
			if (!timeoutRef) {
				const ms = Math.max(0, remainingTime ?? duration);
				if (ms === 0) {
					handleClose();
				} else {
					timerStartRef = Date.now();
					timeoutRef = setTimeout(() => {
						handleClose();
					}, ms);
				}
			}
		}
	}
}

$: if (mounted && toastRef && !isSwiping && !swipeDismissDirection) {
	toastRef.style.setProperty("--swipe-translate-x", "0px");
	toastRef.style.setProperty("--swipe-translate-y", "0px");
}

let swipeDirections = getDefaultSwipeDirections(position);
$: swipeDirections = getDefaultSwipeDirections(position);

const handlePointerDown = (event: PointerEvent) => {
	if (event.pointerType === "mouse" && event.button !== 0) return;
	if (event.button === 2) return;
	if (isExiting) return;

	const target = event.target as HTMLElement;
	if (target.closest("button, a, input, textarea, select")) {
		return;
	}

	clearSwipeRefs();
	pointerStart = { x: event.clientX, y: event.clientY };
	dragStartTime = Date.now();
	if (toastRef) {
		toastRef.style.setProperty("--swipe-translate-x", "0px");
		toastRef.style.setProperty("--swipe-translate-y", "0px");
	}
	swipeDismissDirection = null;
	isSwiping = true;
	if (!isPointerHeld) {
		isPointerHeld = true;
		onGroupHoldChange?.(true);
	}
	const currentTarget = event.currentTarget as HTMLElement | null;
	currentTarget?.setPointerCapture(event.pointerId);
};

const handlePointerMove = (event: PointerEvent) => {
	if (!pointerStart) return;
	if (isExiting) return;

	if (event.pointerType === "touch") {
		event.preventDefault();
	}

	const xDelta = event.clientX - pointerStart.x;
	const yDelta = event.clientY - pointerStart.y;

	let axis = swipeAxis;
	if (!axis) {
		if (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1) {
			axis = Math.abs(xDelta) > Math.abs(yDelta) ? "x" : "y";
			swipeAxis = axis;
		} else {
			return;
		}
	}

	const dampen = (delta: number) => {
		const factor = Math.abs(delta) / 20;
		return delta * (1 / (1.5 + factor));
	};

	let nextX = 0;
	let nextY = 0;

	if (axis === "x") {
		const allowLeft = swipeDirections.includes("left");
		const allowRight = swipeDirections.includes("right");
		if (!allowLeft && !allowRight) {
			swipeAxis = "y";
			axis = "y";
		} else if ((allowLeft && xDelta < 0) || (allowRight && xDelta > 0)) {
			nextX = xDelta;
		} else {
			nextX = dampen(xDelta);
		}
	}

	if (axis === "y") {
		const allowTop = swipeDirections.includes("top");
		const allowBottom = swipeDirections.includes("bottom");
		if (!allowTop && !allowBottom) {
			swipeAxis = "x";
			axis = "x";
		} else if ((allowTop && yDelta < 0) || (allowBottom && yDelta > 0)) {
			nextY = yDelta;
		} else {
			nextY = dampen(yDelta);
		}
	}

	lastSwipe = { x: nextX, y: nextY };
	if (toastRef) {
		toastRef.style.setProperty("--swipe-translate-x", `${nextX}px`);
		toastRef.style.setProperty("--swipe-translate-y", `${nextY}px`);
	}
};

const handlePointerUp = (event: PointerEvent) => {
	const currentTarget = event.currentTarget as HTMLElement | null;
	if (currentTarget?.hasPointerCapture(event.pointerId)) {
		currentTarget.releasePointerCapture(event.pointerId);
	}

	if (!pointerStart) {
		swipeDismissDirection = null;
		isSwiping = false;
		clearSwipeRefs();
		return;
	}

	const elapsed = dragStartTime ? Date.now() - dragStartTime : 0;

	const axis = swipeAxis;
	const { x, y } = lastSwipe;
	let dismissed = false;

	if (axis) {
		const distance = axis === "x" ? x : y;
		const velocity = elapsed > 0 ? Math.abs(distance) / elapsed : 0;
		const meetsThreshold =
			Math.abs(distance) >= SWIPE_DISMISS_THRESHOLD ||
			velocity > SWIPE_DISMISS_VELOCITY;

		if (meetsThreshold && Math.abs(distance) > 0) {
			let direction: SwipeDirection;
			if (axis === "x") {
				direction = distance > 0 ? "right" : "left";
			} else {
				direction = distance > 0 ? "bottom" : "top";
			}

			if (swipeDirections.includes(direction)) {
				swipeDismissDirection = direction;
				dismissed = true;
				handleClose();
			}
		}
	}

	if (!dismissed) {
		swipeDismissDirection = null;
	}

	isSwiping = false;
	clearSwipeRefs();
	if (isPointerHeld) {
		isPointerHeld = false;
		onGroupHoldChange?.(false);
	}
};

const handlePointerCancel = (event: PointerEvent) => {
	const currentTarget = event.currentTarget as HTMLElement | null;
	if (currentTarget?.hasPointerCapture(event.pointerId)) {
		currentTarget.releasePointerCapture(event.pointerId);
	}
	swipeDismissDirection = null;
	isSwiping = false;
	clearSwipeRefs();
	if (isPointerHeld) {
		isPointerHeld = false;
		onGroupHoldChange?.(false);
	}
};

const zIndexBase = Number(ANIMATION_CONFIG.Z_INDEX_BASE);

let isTopPosition = false;
let maxVisibleIndex = 0;
let visibleIndex = 0;
let defaultCollapsedOffset = 0;
let resolvedCollapsedOffset = 0;
let resolvedHiddenCollapsedOffset = 0;
let scale = 1;
let visibleScale = 1;
let zIndex = zIndexBase;
let stackHidden = false;
let hiddenByStacking = false;
let isStackLeader = false;
let isLatest = false;
type PositionConfig = (typeof POSITION_CONFIGS)[ToastPosition];
let config: PositionConfig = POSITION_CONFIGS["bottom-center"];

$: isTopPosition = position?.startsWith("top-") ?? false;
$: maxVisibleIndex = Math.max(0, ANIMATION_CONFIG.MAX_VISIBLE_TOASTS - 1);
$: visibleIndex = Math.min(index, maxVisibleIndex);
$: defaultCollapsedOffset = isTopPosition
	? index * ANIMATION_CONFIG.STACK_OFFSET
	: -(index * ANIMATION_CONFIG.STACK_OFFSET);
$: resolvedCollapsedOffset =
	typeof collapsedOffset === "number" && Number.isFinite(collapsedOffset)
		? collapsedOffset
		: defaultCollapsedOffset;
$: resolvedHiddenCollapsedOffset =
	typeof hiddenCollapsedOffset === "number" &&
	Number.isFinite(hiddenCollapsedOffset)
		? hiddenCollapsedOffset
		: resolvedCollapsedOffset;
$: scale = Math.max(
	ANIMATION_CONFIG.MIN_SCALE,
	1 - index * ANIMATION_CONFIG.SCALE_FACTOR,
);
$: visibleScale = Math.max(
	ANIMATION_CONFIG.MIN_SCALE,
	1 - visibleIndex * ANIMATION_CONFIG.SCALE_FACTOR,
);
$: zIndex = zIndexBase - renderIndex;
$: stackHidden = index >= ANIMATION_CONFIG.MAX_VISIBLE_TOASTS;
$: hiddenByStacking = stackHidden && animationState !== "exiting";
$: isStackLeader = index === 0;
$: isLatest = isStackLeader && !shouldClose;
$: config = POSITION_CONFIGS[(position ?? "bottom-center") as ToastPosition];

let transformStyle = {
	transform: "translate(0px, 0px)",
	opacity: 1,
};
let transitionDuration = `${ANIMATION_CONFIG.ENTER_DURATION}s`;
let transitionTimingFunction = ANIMATION_CONFIG.EASING_DEFAULT;
let canSwipe = swipeDirections.length > 0;
let swipeCursorClass: string | undefined = undefined;
let titleId: string | undefined = undefined;
let descriptionId: string | undefined = undefined;
let liveRole: "alert" | "status" = "status";
let livePoliteness: "assertive" | "polite" = "polite";

$: transformStyle = (() => {
	const baseOffsetY = stackHidden
		? resolvedHiddenCollapsedOffset
		: resolvedCollapsedOffset;
	const promotionOffset =
		typeof expandedGap === "number"
			? expandedGap
			: ANIMATION_CONFIG.EXPANDED_GAP;
	const expandedTranslateY = isTopPosition ? expandedOffset : -expandedOffset;
	const hiddenExpandedTranslateY = expandedTranslateY - promotionOffset;

	let translateX = 0;
	let translateY = baseOffsetY;
	let scaleValue = stackHidden
		? visibleIndex === 0
			? 1
			: visibleScale
		: isStackLeader
			? 1
			: scale;
	let opacityValue = stackHidden ? 0 : 1;

	if (stackHidden) {
		if (isGroupHovered && animationState !== "exiting") {
			translateX = 0;
			translateY = hiddenExpandedTranslateY;
			scaleValue = 1;
		}
	} else if (isGroupHovered && animationState !== "exiting") {
		translateX = 0;
		translateY = expandedTranslateY;
		scaleValue = 1;
		opacityValue = 1;
	} else {
		switch (animationState) {
			case "entering":
				translateX = config.animateIn.x;
				translateY = config.animateIn.y;
				scaleValue = 1;
				opacityValue = 0;
				break;
			case "entered":
				translateX = 0;
				translateY = baseOffsetY;
				scaleValue = 1;
				opacityValue = 1;
				break;
			case "exiting": {
				scaleValue = 1;
				opacityValue = 0;
				if (swipeDismissDirection) {
					switch (swipeDismissDirection) {
						case "left":
							translateX = -SWIPE_EXIT_DISTANCE;
							translateY = 0;
							break;
						case "right":
							translateX = SWIPE_EXIT_DISTANCE;
							translateY = 0;
							break;
						case "top":
							translateX = 0;
							translateY = -SWIPE_EXIT_DISTANCE;
							break;
						case "bottom":
							translateX = 0;
							translateY = SWIPE_EXIT_DISTANCE;
							break;
						default:
							translateX = config.animateOut.x;
							translateY = config.animateOut.y;
							break;
					}
				} else {
					translateX = config.animateOut.x;
					translateY = config.animateOut.y;
				}
				break;
			}
			default:
				translateX = 0;
				translateY = baseOffsetY;
				scaleValue = isStackLeader ? 1 : scale;
				opacityValue = stackHidden ? 0 : 1;
				break;
		}
	}

	const transform = `translate(calc(${translateX}px + var(--swipe-translate-x, 0px)), calc(${translateY}px + var(--swipe-translate-y, 0px))) scale(${scaleValue})`;

	return {
		transform,
		opacity: opacityValue,
	};
})();

$: transitionDuration = (() => {
	switch (animationState) {
		case "entering":
		case "entered":
			return `${ANIMATION_CONFIG.ENTER_DURATION}s`;
		case "exiting":
			return `${ANIMATION_CONFIG.EXIT_DURATION}s`;
		default:
			return `${ANIMATION_CONFIG.STACK_DURATION}s`;
	}
})();

$: transitionTimingFunction =
	animationState === "exiting"
		? ANIMATION_CONFIG.EASING_EXIT
		: ANIMATION_CONFIG.EASING_DEFAULT;

$: canSwipe = swipeDirections.length > 0;
$: swipeCursorClass = canSwipe
	? isSwiping
		? "cursor-grabbing"
		: "cursor-grab"
	: undefined;

$: titleId = title ? `${id}-title` : undefined;
$: descriptionId = description ? `${id}-desc` : undefined;
$: liveRole = variant === "destructive" ? "alert" : "status";
$: livePoliteness = variant === "destructive" ? "assertive" : "polite";

const handleBlurCapture = (event: FocusEvent) => {
	const next = event.relatedTarget as Node | null;
	if (!toastRef || !next || !toastRef.contains(next)) {
		isItemHovered = false;
	}
};
</script>

<div
    bind:this={toastRef}
    class={cn(
        toastContainerVariants({ position, variant }),
        className,
        swipeCursorClass,
        stackHidden && "pointer-events-none",
    )}
    style:transform-origin={position?.startsWith("top-")
        ? "center top"
        : "center bottom"}
    style:z-index={zIndex}
    style:transition={isSwiping
        ? `transform 0s linear, opacity ${transitionDuration} ${transitionTimingFunction}`
        : `transform ${transitionDuration} ${transitionTimingFunction}, opacity ${transitionDuration} ${transitionTimingFunction}`}
    style:transform={transformStyle.transform}
    style:opacity={transformStyle.opacity}
    role={stackHidden ? undefined : liveRole}
    aria-live={stackHidden ? undefined : livePoliteness}
    aria-atomic={stackHidden ? undefined : "true"}
    aria-describedby={stackHidden ? undefined : descriptionId}
    aria-hidden={stackHidden ? true : undefined}
    tabindex="-1"
    ontransitionend={handleTransitionEnd}
    data-toast-id={id}
>
    <div
        role="alert"
        class={cn(swipeCursorClass)}
        onpointerdown={handlePointerDown}
        onpointermove={handlePointerMove}
        onpointerup={handlePointerUp}
        onpointercancel={handlePointerCancel}
        onmouseenter={() => {
            isItemHovered = true;
            onGroupHoverEnter?.();
        }}
        onmouseleave={() => (isItemHovered = false)}
        onfocuscapture={() => (isItemHovered = true)}
        onblurcapture={handleBlurCapture}
    >
        <div class={cn(toastContentVariants({ variant }))}>
            <button
                type="button"
                onclick={handleClose}
                class={cn(
                    "absolute top-2 right-2 cursor-pointer rounded-vs-sm p-1 text-vs-foreground/45 hover:bg-vs-popover-muted hover:text-vs-foreground/70 transition-[background-color,color,box-shadow] ease-vs-button duration-100 focus-visible:ring-1 focus-visible:ring-vs-ring/50 focus-visible:outline-none",
                )}
                aria-label="Close toast"
            >
                <svg
                    aria-hidden="true"
                    class="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <line x1="18" x2="6" y1="6" y2="18" />
                    <line x1="6" x2="18" y1="6" y2="18" />
                </svg>
            </button>

            <div class="p-4 pr-8">
                {#if title}
                    <div
                        id={titleId}
                        class="mb-1 text-sm leading-none font-medium select-none"
                    >
                        {title}
                    </div>
                {/if}
                {#if description}
                    <div
                        id={descriptionId}
                        class="text-sm leading-snug text-vs-foreground/70 text-balance select-none"
                    >
                        {description}
                    </div>
                {/if}
                {#if action}
                    <div class="mt-3">
                        <button
                            type="button"
                            onclick={() => {
                                action.onClick();
                                handleClose();
                            }}
                            class="relative inline-flex cursor-pointer items-center justify-center rounded-vs-md px-3 py-1.5 text-sm font-medium bg-vs-foreground text-vs-popover shadow-vs-button transition-[background-color,color,box-shadow] ease-vs-button duration-100 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:ring-offset-vs-ring-offset/50 focus-visible:outline-none focus-visible:ring-vs-ring/50"
                        >
                            {action.label}
                        </button>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>
