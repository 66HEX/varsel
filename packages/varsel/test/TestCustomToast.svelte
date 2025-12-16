<script lang="ts">
  import type { PositionedToast } from '../src/lib/core/types'; // Import from varsel's types

  export let id: string;
  export let toast: PositionedToast; // Full toast object from varsel
  export let message: string;
  export let count: number | undefined = undefined; // Make count optional
</script>

<div data-testid="custom-toast-root">
  <h1>Custom Toast Component</h1>
  <p>ID: {id}</p>
  <p>Message: {message}</p>
  <p>Count: {count ?? 'N/A'}</p>
</div>
