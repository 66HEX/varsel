import { toastState } from "./toast-state";
import type {
	PromiseToastState,
	ToastData,
	ToastInvoker,
	ToastPromiseOptions,
} from "./types";

const normalizeToastData = (
	data: Omit<ToastData, "id"> | string,
): Omit<ToastData, "id"> => {
	if (typeof data === "string") {
		return { description: data };
	}
	return data;
};

const resolvePromiseState = async <Value>(
	value: Value,
	state: PromiseToastState<Value>,
): Promise<Omit<ToastData, "id">> => {
	const resolved =
		typeof state === "function" ? await state(value) : await state;
	return normalizeToastData(resolved);
};

const createToast: ToastInvoker = ((data: Omit<ToastData, "id"> | string) => {
	return toastState.add(normalizeToastData(data));
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

createToast.promise = <T, E = unknown>(
	promise: PromiseLike<T>,
	options: ToastPromiseOptions<T, E>,
): string => {
	const loadingData = normalizeToastData(options.loading);
	const toastId = toastState.add({
		...loadingData,
		duration: loadingData.duration ?? 0,
		isLoading: true,
		showClose: loadingData.showClose ?? false,
	});

	const handleResult = async <Value>(
		state: PromiseToastState<Value>,
		value: Value,
		defaultVariant?: ToastData["variant"],
	) => {
		const payload = await resolvePromiseState(value, state);
		toastState.update(toastId, {
			...payload,
			isLoading: false,
			duration: payload.duration,
			variant: payload.variant ?? defaultVariant,
			showClose: payload.showClose ?? false,
		});
	};

	Promise.resolve(promise)
		.then(async (value) => {
			await handleResult(options.success, value, "success");
			return value;
		})
		.catch(async (error: E) => {
			await handleResult(options.error, error, "destructive");
		});

	return toastId;
};

createToast.dismiss = (id: string): void => {
	toastState.update(id, { shouldClose: true });
};

createToast.dismissAll = (): void => {
	toastState.dismissAll();
};

export const toast = createToast;
