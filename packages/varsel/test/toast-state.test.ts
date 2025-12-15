import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToastState } from '../src/lib/core/toast-state';

describe('ToastState', () => {
	let toastState: ToastState;

	beforeEach(() => {
		toastState = new ToastState();
	});

	it('initializes with an empty list', () => {
		expect(toastState.getToasts()).toHaveLength(0);
	});

	it('adds a toast and returns a unique ID', () => {
		const id = toastState.add({ title: 'Test Toast' });
		expect(typeof id).toBe('string');
		expect(toastState.getToasts()).toHaveLength(1);
		expect(toastState.getToasts()[0].title).toBe('Test Toast');
	});

	it('notifies subscribers when adding a toast', () => {
		const subscriberSpy = vi.fn();
		toastState.subscribe(subscriberSpy);

		toastState.add({ title: 'Test' });
		
		expect(subscriberSpy).toHaveBeenCalledTimes(1);
		expect(subscriberSpy).toHaveBeenCalledWith(expect.arrayContaining([
			expect.objectContaining({ title: 'Test' })
		]));
	});

	it('correctly unsubscribes listeners', () => {
		const subscriberSpy = vi.fn();
		const unsubscribe = toastState.subscribe(subscriberSpy);

		unsubscribe();
		toastState.add({ title: 'Test' });

		expect(subscriberSpy).not.toHaveBeenCalled();
	});

	it('removes a toast by ID', () => {
		const id = toastState.add({ title: 'To Remove' });
		expect(toastState.getToasts()).toHaveLength(1);

		toastState.remove(id);
		expect(toastState.getToasts()).toHaveLength(0);
	});

	it('handles removal of non-existent IDs gracefully', () => {
		toastState.add({ title: 'Existing' });
		toastState.remove('non-existent-id');
		expect(toastState.getToasts()).toHaveLength(1);
	});

	it('updates an existing toast', () => {
		const id = toastState.add({ title: 'Original' });
		toastState.update(id, { title: 'Updated' });

		const toasts = toastState.getToasts();
		expect(toasts[0].title).toBe('Updated');
	});

	it('ignores updates for non-existent IDs', () => {
		const id = toastState.add({ title: 'Original' });
		toastState.update('fake-id', { title: 'Changed' });

		const toasts = toastState.getToasts();
		expect(toasts[0].title).toBe('Original');
	});

	it('marks all toasts for dismissal', () => {
		toastState.add({ title: 'One' });
		toastState.add({ title: 'Two' });
		
		// Verify initial state
		expect(toastState.getToasts().every(t => !t.shouldClose)).toBe(true);

		toastState.dismissAll();

		const toasts = toastState.getToasts();
		expect(toasts).toHaveLength(2);
		expect(toasts.every(t => t.shouldClose)).toBe(true);
	});
});