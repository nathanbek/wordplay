<script>
    export let href = '#';
</script>

<a class="action" {href}>
    <slot />
</a>

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
</style>
