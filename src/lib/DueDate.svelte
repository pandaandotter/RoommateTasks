<script lang="ts">
    export let dueDate: string;
    let now = new Date();
    let due = new Date(dueDate);
    let diff = due.getTime() - now.getTime();
</script>
Diff in days:
{#if diff > 0}
    {Math.floor(diff / (1000 * 60 * 60 * 24))}
{:else}
    0
{/if}

