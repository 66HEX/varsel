import { redirect } from "@sveltejs/kit";
import { docLinks } from "$lib/docs/navigation";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => {
	const firstLink = docLinks[0];

	if (!firstLink) {
		return {};
	}

	throw redirect(307, firstLink.href);
};
