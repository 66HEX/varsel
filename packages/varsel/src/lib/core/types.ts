import type { VariantProps } from "class-variance-authority";
import type { toastContainerVariants } from "./variants";
import type { ToastPosition } from "./positions";
import type { SwipeAxis, SwipeDirection } from "./swipe";

export interface ToastData extends VariantProps<typeof toastContainerVariants> {
	id: string;
	title?: string;
	description?: string;
	className?: string;
	duration?: number;
	isLoading?: boolean;
	showClose?: boolean;
	action?: {
		label: string;
		onClick: () => void;
	};
	onClose?: () => void;
	shouldClose?: boolean;
	isLeaving?: boolean;
	position?: ToastPosition;
}

export type PromiseToastState<Value> =
	| string
	| Omit<ToastData, "id">
	| ((
			value: Value,
		) => string | Omit<ToastData, "id"> | PromiseLike<string | Omit<ToastData, "id">>);

export type ToastPromiseOptions<
	SuccessValue = unknown,
	ErrorValue = unknown,
> = {
	loading: Omit<ToastData, "id"> | string;
	success: PromiseToastState<SuccessValue>;
	error: PromiseToastState<ErrorValue>;
};

export type ToastInvoker = {
	(data: Omit<ToastData, "id"> | string): string;
	success: (data: Omit<ToastData, "id" | "variant"> | string) => string;
	warning: (data: Omit<ToastData, "id" | "variant"> | string) => string;
	error: (data: Omit<ToastData, "id" | "variant"> | string) => string;
	promise: <T, E = unknown>(
		promise: PromiseLike<T>,
		options: ToastPromiseOptions<T, E>,
	) => string;
	dismiss: (id: string) => void;
	dismissAll: () => void;
};

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

export type ToastSubscriber = (toasts: ToastData[]) => void;

export type { ToastPosition, SwipeAxis, SwipeDirection };
