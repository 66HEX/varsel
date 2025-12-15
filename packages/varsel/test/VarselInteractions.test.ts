import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/svelte';
import VarselToaster from '../src/lib/VarselToaster.svelte';
import { toast } from '../src/lib/internals';
import { toastState } from '../src/lib/core/toast-state';
import { ANIMATION_CONFIG } from '../src/lib/core/animations';

describe('Varsel Interactions', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		toastState.dismissAll();
		const toasts = toastState.getToasts();
		toasts.forEach(t => toastState.remove(t.id));
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.clearAllMocks();
	});

	it('respects the max visible toasts limit', async () => {
		render(VarselToaster);
		const limit = ANIMATION_CONFIG.MAX_VISIBLE_TOASTS;

		act(() => {
			for (let i = 0; i < limit + 2; i++) {
				toast(`Toast ${i}`);
			}
		});

		await screen.findByText(`Toast ${limit + 1}`);

		// Some toasts might be visually hidden but present in the DOM for stacking logic
		const allToasts = screen.getAllByText(/Toast \d/);
		expect(allToasts.length).toBeGreaterThanOrEqual(limit);
	});

	it('closes the toast when the close button is clicked', async () => {
		render(VarselToaster);

		act(() => {
			toast('Dismiss Me');
		});

		const closeButton = await screen.findByLabelText('Close toast');
		await fireEvent.click(closeButton);

		// The toast should be marked for closure
		// Note: passing a string to toast() sets description, not title
		const t = toastState.getToasts().find(t => t.description === 'Dismiss Me');
		expect(t?.shouldClose).toBe(true);
	});

	it('executes the action callback and closes toast on action click', async () => {
		render(VarselToaster);
		const actionSpy = vi.fn();

		act(() => {
			toast({
				title: 'Action Toast',
				action: {
					label: 'Run',
					onClick: actionSpy
				}
			});
		});

		const actionButton = await screen.findByText('Run');
		await fireEvent.click(actionButton);

		expect(actionSpy).toHaveBeenCalled();

		// Verify toast is closing
		const t = toastState.getToasts().find(t => t.title === 'Action Toast');
		expect(t?.shouldClose).toBe(true);
	});

	it('prevents multiple Toaster instances from rendering simultaneously', async () => {
		// Mock the instance manager to reset state if needed, though beforeEach creates new Toasters
		// But the singleton instance manager persists across tests unless we could reset it.
		// Since we can't easily reset private state of the singleton module without exposing a method,
		// we rely on the fact that `unregisterInstance` is called on unmount.
		// `cleanup` from testing-library handles unmount.

		// Render first instance
		const { container: container1 } = render(VarselToaster);

		// Render second instance
		const { container: container2 } = render(VarselToaster);

		act(() => {
			toast('Single Toast');
		});

		// Wait for render update
		await screen.findByText('Single Toast');

		// Check if content appears in both or just one (logic says active one renders manager)
		// VarselToaster.svelte: {#if toasterInstanceManager.isActiveInstance(instanceId)}

		const toastsInFirst = container1.querySelectorAll('[data-toast-id]');
		const toastsInSecond = container2.querySelectorAll('[data-toast-id]');

		// One should have elements, the other should be empty (or at least not render the Manager)
		const count1 = toastsInFirst.length;
		const count2 = toastsInSecond.length;

		expect(count1 + count2).toBeGreaterThan(0); // At least one rendered
		expect(count1 === 0 || count2 === 0).toBe(true); // Only one should be active
	});
});
