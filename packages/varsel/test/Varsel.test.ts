import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/svelte';
import VarselToaster from '../src/lib/VarselToaster.svelte';
import { toast } from '../src/lib/internals';
import { toastState } from '../src/lib/core/toast-state';

// Utility to simulate delay for promise resolution
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe('Varsel Integration Tests', () => {
	beforeEach(() => {
		// Reset global state to ensure test isolation
		toastState.dismissAll();
		const toasts = toastState.getToasts();
		toasts.forEach(t => toastState.remove(t.id));
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('renders without crashing', () => {
		const { container } = render(VarselToaster);
		expect(container).toBeInTheDocument();
	});

	it('displays a toast when toast() is called', async () => {
		render(VarselToaster);
		
		act(() => {
			toast('Hello World');
		});

		await waitFor(() => {
			expect(screen.getByText('Hello World')).toBeInTheDocument();
		});
	});

	it('applies custom CSS classes to the toast container', async () => {
		render(VarselToaster);

		act(() => {
			toast({ title: 'Custom Class Toast', className: 'my-custom-class' });
		});

		const toastElement = await screen.findByText('Custom Class Toast');
		// The class is applied to the container, which is an ancestor of the text
		const container = toastElement.closest('[data-toast-id]');
		expect(container).toHaveClass('my-custom-class');
	});

	it('renders loading state manually', async () => {
		render(VarselToaster);

		act(() => {
			toast({ title: 'Loading...', isLoading: true });
		});

		// Check for the presence of the spinner or aria-busy attribute
		const toastElement = await screen.findByText('Loading...');
		const container = toastElement.closest('[data-toast-id]');
		const contentWrapper = container?.querySelector('[aria-busy="true"]');
		
		expect(contentWrapper).toBeInTheDocument();
	});

	it('renders semantic variants (success, error, warning)', async () => {
		render(VarselToaster);

		act(() => {
			toast.success('Success Message');
			toast.error('Error Message');
			toast.warning('Warning Message');
		});

		await waitFor(() => {
			expect(screen.getByText('Success Message')).toBeInTheDocument();
			expect(screen.getByText('Error Message')).toBeInTheDocument();
			expect(screen.getByText('Warning Message')).toBeInTheDocument();
		});
	});

	it('dismisses a toast programmatically', async () => {
		render(VarselToaster);
		let id: string;

		act(() => {
			id = toast({ title: 'Persistent Toast', duration: Infinity });
		});

		await screen.findByText('Persistent Toast');

		act(() => {
			toast.dismiss(id!);
		});

		// Wait for the exit animation logic to trigger (shouldClose becomes true)
		await waitFor(() => {
			const t = toastState.getToasts().find(item => item.id === id);
			expect(t?.shouldClose).toBe(true);
		});
	});

	it('dismisses all toasts programmatically', async () => {
		render(VarselToaster);

		act(() => {
			toast('Toast 1');
			toast('Toast 2');
		});

		await screen.findByText('Toast 2');

		act(() => {
			toast.dismissAll();
		});

		await waitFor(() => {
			const toasts = toastState.getToasts();
			expect(toasts.every(t => t.shouldClose)).toBe(true);
		});
	});

	it('handles promises lifecycle (loading -> success)', async () => {
		render(VarselToaster);
		let resolvePromise: (val: string) => void;
		const promise = new Promise<string>((resolve) => {
			resolvePromise = resolve;
		});

		act(() => {
			toast.promise(promise, {
				loading: 'Loading Data...',
				success: (val) => `Success: ${val}`,
				error: 'Error'
			});
		});

		// Verify loading state
		expect(await screen.findByText('Loading Data...')).toBeInTheDocument();

		// Resolve promise and wait for reaction
		await act(async () => {
			resolvePromise!('Data Loaded');
			await wait(50);
		});

		// Verify success state
		await waitFor(() => {
			expect(screen.getByText('Success: Data Loaded')).toBeInTheDocument();
		}, { timeout: 2000 });
	});

	it('shows close button by default for promise toasts', async () => {
		render(VarselToaster);
		let resolvePromise: (val: string) => void;
		const promise = new Promise<string>((resolve) => {
			resolvePromise = resolve;
		});

		act(() => {
			toast.promise(promise, {
				loading: 'Loading Closable...',
				success: 'Done',
				error: 'Error',
			});
		});

		expect(await screen.findByText('Loading Closable...')).toBeInTheDocument();
		expect(screen.getByLabelText('Close toast')).toBeInTheDocument();

		await act(async () => {
			resolvePromise!('ok');
			await wait(50);
		});

		expect(await screen.findByText('Done')).toBeInTheDocument();
		expect(screen.getByLabelText('Close toast')).toBeInTheDocument();
	});

	it('respects showClose: false for promise toasts', async () => {
		render(VarselToaster);

		act(() => {
			toast.promise(Promise.resolve('ok'), {
				loading: { description: 'No Close Loading', showClose: false },
				success: { description: 'No Close Success', showClose: false },
				error: 'Error',
			});
		});

		expect(await screen.findByText('No Close Loading')).toBeInTheDocument();
		expect(screen.queryByLabelText('Close toast')).not.toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByText('No Close Success')).toBeInTheDocument();
		});
		expect(screen.queryByLabelText('Close toast')).not.toBeInTheDocument();
	});
});
