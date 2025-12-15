import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import VarselToaster from '../src/lib/VarselToaster.svelte';
import { toast } from '../src/lib/internals';
import { toastState } from '../src/lib/core/toast-state';

describe('Varsel Accessibility (A11y)', () => {
	beforeEach(() => {
		toastState.dismissAll();
		const toasts = toastState.getToasts();
		toasts.forEach(t => toastState.remove(t.id));
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('assigns correct ARIA roles and live regions based on variant', async () => {
		render(VarselToaster);

		act(() => {
			toast.success('Success Toast');
			toast.error('Error Toast');
		});

		await waitFor(() => {
			// Find outer containers by checking text content inside
			// We look for elements with role that contain the text
			const successEl = screen.getByText('Success Toast');
			const errorEl = screen.getByText('Error Toast');
			
			const successToast = successEl.closest('[role="status"]');
			const errorToast = errorEl.closest('[role="alert"]');

			expect(successToast).toBeInTheDocument();
			expect(successToast).toHaveAttribute('aria-live', 'polite');

			expect(errorToast).toBeInTheDocument();
			expect(errorToast).toHaveAttribute('aria-live', 'assertive');
		});
	});

	it('allows focusing action buttons via keyboard', async () => {
		const user = userEvent.setup();
		render(VarselToaster);

		act(() => {
			toast({
				title: 'Action Toast',
				action: {
					label: 'Retry',
					onClick: () => {}
				}
			});
		});

		// Wait for animation and rendering
		const actionBtn = await screen.findByText('Retry', {}, { timeout: 2000 });
		
		// Focus the toast container first (simulating user tabbing into the region)
		const closeBtn = screen.getByLabelText('Close toast');
		closeBtn.focus();
		
		// Tab to action button
		await user.tab();

		expect(document.activeElement).toBe(actionBtn);
	});

	it('closes the newest toast when Escape is pressed while focused', async () => {
		const user = userEvent.setup();
		render(VarselToaster);

		act(() => {
			toast('Press Escape');
		});

		const toastElement = await screen.findByText('Press Escape', {}, { timeout: 2000 });
		
		// Varsel requires focus to be within the toast for Escape to work
		const closeBtn = screen.getByLabelText('Close toast');
		closeBtn.focus();

		await user.keyboard('{Escape}');

		await waitFor(() => {
			const activeToasts = toastState.getToasts().filter(t => !t.shouldClose);
			expect(activeToasts).toHaveLength(0);
		}, { timeout: 1500 });
	});

	it('passes axe accessibility audit for a complex toast', async () => {
		const { container } = render(VarselToaster);

		act(() => {
			toast({
				title: 'Complex Toast',
				description: 'Description text.',
				action: { label: 'Undo', onClick: () => {} }
			});
		});

		await screen.findByText('Complex Toast');
		
		const results = await axe(container);
		expect(results).toHaveNoViolations();
	});
});
