export const FOCUSABLE_SELECTORS = [
	"button:not([disabled])",
	"input:not([disabled])",
	"textarea:not([disabled])",
	"select:not([disabled])",
	"a[href]",
	'[tabindex]:not([tabindex="-1"])',
].join(", ");
