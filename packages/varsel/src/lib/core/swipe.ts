import type { ToastPosition } from "./positions";

export type SwipeDirection = "top" | "bottom" | "left" | "right";
export type SwipeAxis = "x" | "y";

export const SWIPE_DISMISS_THRESHOLD = 45;
export const SWIPE_DISMISS_VELOCITY = 0.11;
export const SWIPE_EXIT_DISTANCE = 600;

export const getDefaultSwipeDirections = (
	position?: ToastPosition | null,
): SwipeDirection[] => {
	if (!position) {
		return ["top", "bottom", "left", "right"];
	}

	const [vertical, horizontal] = position.split("-") as [
		string,
		string | undefined,
	];
	const directions: SwipeDirection[] = [];

	if (vertical === "top" || vertical === "bottom") {
		directions.push(vertical);
	}

	if (horizontal === "left" || horizontal === "right") {
		directions.push(horizontal);
	}

	if (directions.length === 0) {
		directions.push("top", "bottom");
	}

	return directions;
};
