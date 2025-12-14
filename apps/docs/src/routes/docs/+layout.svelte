<script lang="ts">
import { page } from "$app/state";
import DocsSidebar from "$lib/components/docs/DocsSidebar.svelte";
import TableOfContents from "$lib/components/docs/TableOfContents.svelte";
import { docLinks, docNavGroups } from "$lib/docs/navigation";
import { getDocMetadata } from "$lib/docs/metadata";

let { children } = $props();

const currentPage = page;
const normalizePath = (path: string) => {
	if (path === "/") return path;
	return path.replace(/\/+$/, "");
};

const currentUrl = $derived(currentPage.url);
const currentPath = $derived(normalizePath(currentUrl.pathname));
const currentIndex = $derived(
	docLinks.findIndex((link) => normalizePath(link.href) === currentPath),
);
const previousLink = $derived(
	currentIndex > 0 ? docLinks[currentIndex - 1] : null,
);
const nextLink = $derived(
	currentIndex >= 0 && currentIndex < docLinks.length - 1
		? docLinks[currentIndex + 1]
		: null,
);
const currentDocMeta = $derived(getDocMetadata(currentPath));
const pageTitle = $derived(
	currentDocMeta ? `Varsel docs — ${currentDocMeta.title}` : "Varsel docs",
);
const docDescription = $derived(
	currentDocMeta?.description
		? currentDocMeta.description
		: currentDocMeta
			? `${currentDocMeta.title} guide for Varsel notifications.`
			: null,
);
const canonicalUrl = $derived(currentUrl.href);
const docOgImage = $derived(
	new URL("/web-app-manifest-512x512.png", currentUrl).href,
);
const docOgImageAlt = "Varsel logomark";
const docsRootUrl = $derived(new URL("/docs", currentUrl).href);
const docStructuredData = $derived(
	currentDocMeta
		? JSON.stringify({
				"@context": "https://schema.org",
				"@type": "TechArticle",
				headline: currentDocMeta.title,
				description: docDescription ?? undefined,
				url: canonicalUrl,
				mainEntityOfPage: canonicalUrl,
				about: currentDocMeta.title,
				inLanguage: "en",
				isPartOf: {
					"@type": "CreativeWorkSeries",
					name: "Varsel documentation",
					url: docsRootUrl,
				},
				author: {
					"@type": "Person",
					name: "Marek Jóźwiak",
				},
				publisher: {
					"@type": "Organization",
					name: "Varsel",
					logo: {
						"@type": "ImageObject",
						url: docOgImage,
					},
				},
			})
		: null,
);
</script>

<svelte:head>
	<title>{pageTitle}</title>
	{#if docDescription}
		<meta name="description" content={docDescription} />
		<meta property="og:description" content={docDescription} />
		<meta name="twitter:description" content={docDescription} />
	{/if}
	<link rel="canonical" href={canonicalUrl} />
	<meta property="og:title" content={pageTitle} />
	<meta name="twitter:title" content={pageTitle} />
	<meta property="og:type" content="article" />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:image" content={docOgImage} />
	<meta property="og:image:alt" content={docOgImageAlt} />
	<meta property="og:image:type" content="image/svg+xml" />
	<meta name="twitter:image" content={docOgImage} />
	{#if docStructuredData}
		<script type="application/ld+json">
			{docStructuredData}
		</script>
	{/if}
</svelte:head>

<div class="min-h-screen w-full bg-background text-foreground">
	<div class="flex min-h-screen w-full flex-col lg:flex-row lg:items-start">
		<DocsSidebar links={docNavGroups} />

		<section style="view-transition-name: homepage-content" class="flex-1 px-4 pb-10 pt-24 lg:px-12 lg:pb-12 lg:pt-10 lg:ml-64">
			<div class="mx-auto flex w-full max-w-6xl gap-10">
				<article
					class="min-w-0 flex-1 max-w-3xl"
					data-doc-content
				>
					{@render children?.()}

					{#if previousLink || nextLink}
						<nav class="mt-16 border-t border-border pt-8">
							<div class="grid gap-4 sm:grid-cols-2">
								{#if previousLink}
									<a
										class="group flex flex-col rounded-md border border-border bg-card px-4 py-3 shadow-sm transition-[background-color] duration-150 ease-out hover:bg-card-muted"
										href={previousLink.href}
									>
										<span class="text-[10px] font-medium uppercase tracking-wide text-foreground/45">
											Previous
										</span>
										<span class="text-base font-normal text-foreground">
											{previousLink.title}
										</span>
									</a>
								{/if}

								{#if nextLink}
									<a
										class={`group flex flex-col rounded-md border border-border bg-card px-4 py-3 shadow-sm transition-[background-color] duration-150 ease-out hover:bg-card-muted sm:text-right ${previousLink ? "" : "sm:col-start-2"}`}
										href={nextLink.href}
									>
										<span class="text-[10px] font-medium uppercase tracking-wide text-foreground/45">
											Next
										</span>
										<span class="text-base font-normal text-foreground">
											{nextLink.title}
										</span>
									</a>
								{/if}
							</div>
						</nav>
					{/if}
				</article>

				<aside class="hidden w-64 flex-none lg:block ml-auto">
					<TableOfContents />
				</aside>
			</div>
		</section>
	</div>
</div>
