<script lang="ts">
import "./layout.css";
import favicon from "$lib/assets/favicon.svg";
import { VarselToaster } from "varsel";

let { children } = $props();

import { onNavigate } from "$app/navigation";

const isHomePath = (path?: string) => path === "/";
const isDocsPath = (path?: string) => path?.startsWith("/docs");

onNavigate((navigation) => {
	if (!document.startViewTransition) return;

	const fromPath = navigation.from?.url.pathname;
	const toPath = navigation.to?.url.pathname;

	const enteringDocs = isHomePath(fromPath) && isDocsPath(toPath);
	const leavingDocs = isDocsPath(fromPath) && isHomePath(toPath);

	if (!enteringDocs && !leavingDocs) return;

	return new Promise<void>((resolve) => {
		document.startViewTransition(async () => {
			resolve();
			await navigation.complete;
		});
	});
});

</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
{@render children()}
<VarselToaster />
