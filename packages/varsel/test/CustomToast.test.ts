import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/svelte';
import VarselToaster from '../src/lib/VarselToaster.svelte';
import { toast } from '../src/lib/internals';
import { toastState } from '../src/lib/core/toast-state';
import TestCustomToast from './TestCustomToast.svelte';

describe('Custom Toast Integration', () => {
    beforeEach(() => {
        toastState.dismissAll();
        const toasts = toastState.getToasts();
        toasts.forEach(t => toastState.remove(t.id));
    });

    it('renders a custom component when using toast.custom()', async () => {
        render(VarselToaster);

        act(() => {
            toast.custom(TestCustomToast, {
                componentProps: {
                    message: 'Hello Custom World',
                    count: 42
                }
            });
        });

        const customEl = await screen.findByTestId('custom-toast-root');
        expect(customEl).toBeInTheDocument();
        expect(screen.getByText('Custom Toast Component')).toBeInTheDocument();
        expect(screen.getByText('Message: Hello Custom World')).toBeInTheDocument();
        expect(screen.getByText('Count: 42')).toBeInTheDocument();
    });

    it('passes the toast ID to the custom component', async () => {
        render(VarselToaster);
        let id: string;

        act(() => {
            id = toast.custom(TestCustomToast, { componentProps: { message: 'test message for ID' } });
        });

        await waitFor(() => {
             const el = screen.getByText((content, element) => {
                 return content.startsWith('ID: ') && content.includes(id!);
             });
             expect(el).toBeInTheDocument();
        });
    });

    it('allows closing via toast.dismiss(id)', async () => {
        render(VarselToaster);
        let id: string;

        act(() => {
            id = toast.custom(TestCustomToast, { 
                componentProps: { message: 'To Close', count: 1 },
                duration: Infinity 
            });
        });

        await screen.findByTestId('custom-toast-root');

        act(() => {
            toast.dismiss(id!);
        });
        
        await waitFor(() => {
             const t = toastState.getToasts().find(item => item.id === id);
             expect(t?.shouldClose).toBe(true);
        });
    });
});