<<<<<<< HEAD
<script>
    export let href = '#';
</script>

<a class="action" {href}>
    <slot />
</a>
=======
<script lang="ts">
    import { type Snippet } from 'svelte';
    interface Props {
        children: Snippet;
        meta?: boolean;
    }

    let { children, meta = false }: Props = $props();
</script>

<div class="action" class:meta>
    {@render children()}
</div>
>>>>>>> refs/remotes/origin/main

<style>
    .action {
        min-width: 15em;
        width: calc(50% - var(--wordplay-spacing));
        padding: var(--wordplay-spacing);
        border: var(--wordplay-border-color) solid var(--wordplay-border-width);
        border-radius: var(--wordplay-border-radius);
        background: var(--wordplay-background);
        flex: 1 0 auto;
        text-decoration: none;
        color: inherit;
    }

    .meta {
        background: var(--wordplay-alternating-color);
    }
</style>
