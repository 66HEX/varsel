import type { ToastData, ToastSubscriber } from "./types";

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
export { ToastState };
