export const cn = (...values: Array<string | false | undefined | null>) =>
	values.filter(Boolean).join(" ");
