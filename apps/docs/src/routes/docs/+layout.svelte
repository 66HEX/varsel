<script lang="ts">
import { page } from "$app/stores";
import DocsSidebar from "$lib/components/docs/DocsSidebar.svelte";
import TableOfContents from "$lib/components/docs/TableOfContents.svelte";
import { docLinks, docNavGroups } from "$lib/docs/navigation";

let { children } = $props();

const pageStore = page;
const normalizePath = (path: string) => {
	if (path === "/") return path;
	return path.replace(/\/+$/, "");
};

const currentPath = $derived(normalizePath($pageStore.url.pathname));
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
</script>

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
