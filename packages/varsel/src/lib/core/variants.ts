import { cva } from "class-variance-authority";

export const toastContainerVariants = cva(
	"pointer-events-auto fixed rounded-vs-lg border shadow-vs-toast will-change-transform border-vs-border bg-vs-popover",
	{
		variants: {
			position: {
				"top-left": "top-4 left-4 w-full max-w-sm",
				"top-center":
					"top-4 left-1/2 w-full max-w-sm -translate-x-1/2 transform",
				"top-right": "top-4 right-4 w-full max-w-sm",
				"bottom-left": "bottom-4 left-4 w-full max-w-sm",
				"bottom-center":
					"bottom-4 left-1/2 w-full max-w-sm -translate-x-1/2 transform",
				"bottom-right": "right-4 bottom-4 w-full max-w-sm",
			},
			variant: {
				default: "text-vs-foreground",
				success: "text-vs-success/90",
				warning: "text-vs-warning/90",
				destructive: "text-vs-destructive/90",
			},
		},
		defaultVariants: {
			position: "bottom-center",
			variant: "default",
		},
	},
);

export const toastContentVariants = cva("relative overflow-hidden rounded-vs-lg", {
	variants: {
		variant: {
			default: "",
			success: "",
			warning: "",
			destructive: "",
		},
	},
	defaultVariants: {
		variant: "default",
	},
});
