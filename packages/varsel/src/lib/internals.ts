import { cva, type VariantProps } from "class-variance-authority";

export const POSITION_CONFIGS = {
	"top-left": {
		animateIn: { x: -100, y: -20 },
		animateOut: { x: -100, y: -20 },
	},
	"top-center": {
		animateIn: { x: 0, y: -100 },
		animateOut: { x: 0, y: -100 },
	},
	"top-right": {
		animateIn: { x: 100, y: -20 },
		animateOut: { x: 100, y: -20 },
	},
	"bottom-left": {
		animateIn: { x: -100, y: 20 },
		animateOut: { x: -100, y: 100 },
	},
	"bottom-center": {
		animateIn: { x: 0, y: 100 },
		animateOut: { x: 0, y: 100 },
	},
	"bottom-right": {
		animateIn: { x: 100, y: 20 },
		animateOut: { x: 100, y: 100 },
	},
} as const;

export const FOCUSABLE_SELECTORS = [
	"button:not([disabled])",
	"input:not([disabled])",
	"textarea:not([disabled])",
	"select:not([disabled])",
	"a[href]",
	'[tabindex]:not([tabindex="-1"])',
].join(", ");

export const ANIMATION_CONFIG = {
	ENTER_DURATION: 0.75,
	EXIT_DURATION: 0.75,
	STACK_DURATION: 0.75,
	STACK_OFFSET: 16,
	EXPANDED_GAP: 12,
	SCALE_FACTOR: 0.04,
	MIN_SCALE: 0.92,
	MAX_VISIBLE_TOASTS: 3,
	Z_INDEX_BASE: 50,
	EASING_DEFAULT: "var(--ease-vs-toast)",
	EASING_EXIT: "var(--ease-vs-toast)",
} as const;

export const SWIPE_DISMISS_THRESHOLD = 45;
export const SWIPE_DISMISS_VELOCITY = 0.11;
export const SWIPE_EXIT_DISTANCE = 600;

export type SwipeDirection = "top" | "bottom" | "left" | "right";
export type SwipeAxis = "x" | "y";

type ToastSubscriber = (toasts: ToastData[]) => void;

class ToastState {
	private toasts: ToastData[] = [];
	private subscribers: Set<ToastSubscriber> = new Set();
	private idCounter = 0;

	subscribe(callback: ToastSubscriber): () => void {
		this.subscribers.add(callback);
		return () => {
			this.subscribers.delete(callback);
		};
	}

	private notify(): void {
		this.subscribers.forEach((callback) => {
			callback([...this.toasts]);
		});
	}

	private generateId(): string {
		return `toast-${Date.now()}-${++this.idCounter}`;
	}

	add(data: Omit<ToastData, "id">): string {
		const id = this.generateId();
		const newToast: ToastData = { ...data, id };
		this.toasts = [newToast, ...this.toasts];
		this.notify();
		return id;
	}

	remove(id: string): void {
		this.toasts = this.toasts.filter((toast) => toast.id !== id);
		this.notify();
	}

	update(id: string, data: Partial<ToastData>): void {
		this.toasts = this.toasts.map((toast) =>
			toast.id === id ? { ...toast, ...data } : toast,
		);
		this.notify();
	}

	dismissAll(): void {
		this.toasts = this.toasts.map((toast) => ({
			...toast,
			shouldClose: true,
			duration: 0,
		}));
		this.notify();
	}

	getToasts(): ToastData[] {
		return [...this.toasts];
	}
}

export const toastState = new ToastState();

class ToasterInstanceManager {
	private activeInstanceId: string | null = null;
	private instanceCounter = 0;

	registerInstance(): string {
		const instanceId = `toaster-${++this.instanceCounter}`;
		if (!this.activeInstanceId) {
			this.activeInstanceId = instanceId;
		}
		return instanceId;
	}

	unregisterInstance(instanceId: string): void {
		if (this.activeInstanceId === instanceId) {
			this.activeInstanceId = null;
		}
	}

	isActiveInstance(instanceId: string): boolean {
		return this.activeInstanceId === instanceId;
	}
}

export const toasterInstanceManager = new ToasterInstanceManager();

export const toastContainerVariants = cva(
	"pointer-events-auto fixed rounded-lg border shadow-vs-toast will-change-transform border-vs-border bg-vs-popover",
	{
		variants: {
			position: {
				"top-left": "top-4 left-4 w-full max-w-sm",
				"top-center":
					"top-4 left-1/2 w-full max-w-sm -translate-x-1/2 transform",
				"top-right": "top-4 right-4 w-full max-w-sm",
				"bottom-left": "bottom-4 left-4 w-full max-w-sm",
				"bottom-center":
					"bottom-4 left-1/2 w-full max-w-sm -translate-x-1/2 transform",
				"bottom-right": "right-4 bottom-4 w-full max-w-sm",
			},
			variant: {
				default: "text-vs-foreground",
				success: "text-vs-success/90",
				warning: "text-vs-warning/90",
				destructive: "text-vs-destructive/90",
			},
		},
		defaultVariants: {
			position: "bottom-center",
			variant: "default",
		},
	},
);

export const toastContentVariants = cva("relative overflow-hidden rounded-lg", {
	variants: {
		variant: {
			default: "",
			success: "",
			warning: "",
			destructive: "",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});

export type ToastPosition =
	| "top-left"
	| "top-center"
	| "top-right"
	| "bottom-left"
	| "bottom-center"
	| "bottom-right";

export const getDefaultSwipeDirections = (
	position?: ToastPosition | null,
): SwipeDirection[] => {
	if (!position) {
		return ["top", "bottom", "left", "right"];
	}

	const [vertical, horizontal] = position.split("-") as [
		string,
		string | undefined,
	];
	const directions: SwipeDirection[] = [];

	if (vertical === "top" || vertical === "bottom") {
		directions.push(vertical);
	}

	if (horizontal === "left" || horizontal === "right") {
		directions.push(horizontal);
	}

	if (directions.length === 0) {
		directions.push("top", "bottom");
	}

	return directions;
};

export interface ToastData extends VariantProps<typeof toastContainerVariants> {
	id: string;
	title?: string;
	description?: string;
	className?: string;
	duration?: number;
	action?: {
		label: string;
		onClick: () => void;
	};
	onClose?: () => void;
	shouldClose?: boolean;
	isLeaving?: boolean;
}

export type ToastInvoker = {
	(data: Omit<ToastData, "id"> | string): string;
	success: (data: Omit<ToastData, "id" | "variant"> | string) => string;
	warning: (data: Omit<ToastData, "id" | "variant"> | string) => string;
	error: (data: Omit<ToastData, "id" | "variant"> | string) => string;
	dismiss: (id: string) => void;
	dismissAll: () => void;
};

const createToast: ToastInvoker = ((data: Omit<ToastData, "id"> | string) => {
	if (typeof data === "string") {
		return toastState.add({ description: data });
	}
	return toastState.add(data);
}) as ToastInvoker;

createToast.success = (
	data: Omit<ToastData, "id" | "variant"> | string,
): string => {
	if (typeof data === "string") {
		return toastState.add({ description: data, variant: "success" });
	}
	return toastState.add({ ...data, variant: "success" });
};

createToast.warning = (
	data: Omit<ToastData, "id" | "variant"> | string,
): string => {
	if (typeof data === "string") {
		return toastState.add({ description: data, variant: "warning" });
	}
	return toastState.add({ ...data, variant: "warning" });
};

createToast.error = (
	data: Omit<ToastData, "id" | "variant"> | string,
): string => {
	if (typeof data === "string") {
		return toastState.add({ description: data, variant: "destructive" });
	}
	return toastState.add({ ...data, variant: "destructive" });
};

createToast.dismiss = (id: string): void => {
	toastState.update(id, { shouldClose: true });
};

createToast.dismissAll = (): void => {
	toastState.dismissAll();
};

export const toast = createToast;

export type PositionedToast = ToastData & {
	index: number;
	renderIndex: number;
	total: number;
};

export interface VarselItemContext {
	toast: PositionedToast;
	onRemove: (id: string) => void;
	isGroupHovered?: boolean;
	expandedOffset?: number;
	expandedGap?: number;
	collapsedOffset?: number;
	hiddenCollapsedOffset?: number;
	onHeightChange?: (id: string, height: number) => void;
	onGroupHoverEnter?: () => void;
}

export const cn = (...values: Array<string | false | undefined | null>) =>
	values.filter(Boolean).join(" ");
