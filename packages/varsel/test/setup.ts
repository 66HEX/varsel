import '@testing-library/jest-dom';
import * as matchers from 'vitest-axe/matchers';
import { expect, vi } from 'vitest';

expect.extend(matchers);

// Mock ResizeObserver
class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
}

window.ResizeObserver = ResizeObserver;

// Mock Pointer Events methods lacking in jsdom
if (!HTMLElement.prototype.hasPointerCapture) {
	HTMLElement.prototype.hasPointerCapture = () => false;
}
if (!HTMLElement.prototype.setPointerCapture) {
	HTMLElement.prototype.setPointerCapture = () => {};
}
if (!HTMLElement.prototype.releasePointerCapture) {
	HTMLElement.prototype.releasePointerCapture = () => {};
}

// Mock requestAnimationFrame to act more like setTimeout(0) for testing
// or allow jsdom to handle it (jsdom supports it mostly, but sometimes fake timers are better)
// For now, let's stick with jsdom implementation unless it fails.