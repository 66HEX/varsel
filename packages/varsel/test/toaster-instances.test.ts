import { describe, expect, it } from 'vitest';
import { ToasterInstanceManager } from '../src/lib/core/toaster-instances';

describe('ToasterInstanceManager', () => {
	it('keeps the first registered toaster as active', () => {
		const manager = new ToasterInstanceManager();
		const first = manager.registerInstance();
		const second = manager.registerInstance();

		expect(manager.isActiveInstance(first)).toBe(true);
		expect(manager.isActiveInstance(second)).toBe(false);
	});

	it('promotes the next registered instance when active one unregisters', () => {
		const manager = new ToasterInstanceManager();
		const first = manager.registerInstance();
		const second = manager.registerInstance();
		const third = manager.registerInstance();

		manager.unregisterInstance(first);
		expect(manager.isActiveInstance(second)).toBe(true);

		manager.unregisterInstance(second);
		expect(manager.isActiveInstance(third)).toBe(true);

		manager.unregisterInstance(third);
		expect(manager.isActiveInstance(third)).toBe(false);
	});
});
