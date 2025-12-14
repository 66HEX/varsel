export type DocNavLink = {
	title: string;
	href: `/docs/${string}`;
};

export type DocNavGroup = {
	label: string;
	links: DocNavLink[];
};

export const docNavGroups: DocNavGroup[] = [
	{
		label: "Basics",
		links: [
			{
				title: "Overview",
				href: "/docs/overview",
			},
		],
	},
	{
		label: "Usage",
		links: [
			{
				title: "Positions & layout",
				href: "/docs/positions",
			},
			{
				title: "Timing & lifecycle",
				href: "/docs/timing",
			},
			{
				title: "Actions & callbacks",
				href: "/docs/actions",
			},
		],
	},
	{
		label: "Styling",
		links: [
			{
				title: "Variants & styling",
				href: "/docs/variants",
			},
		],
	},
];

export const docLinks: DocNavLink[] = docNavGroups.flatMap((group) => group.links);
