<script lang="ts">
import "./layout.css";
import favicon from "$lib/assets/favicon.svg";
import { VarselToaster } from "varsel";

let { children } = $props();

import { onNavigate } from '$app/navigation';

onNavigate((navigation) => {
  if (!document.startViewTransition) return;

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
