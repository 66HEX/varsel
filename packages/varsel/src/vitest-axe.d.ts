import 'vitest';
import type { AxeMatchers } from 'vitest-axe';

declare module 'vitest' {
	export interface Assertion extends AxeMatchers {}
	export interface AsymmetricMatchersContaining extends AxeMatchers {}
}
