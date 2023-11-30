<script>
	let count = 0;
	let name = 'world';
</script>
<button on:click={() => (count += 1)}>+</button>
{count}
<button on:click={() => (count -= 1)}>-</button>

{#if count > 10}
	<p>{count} is greater than 10</p>
{:else}
	<p>{count} is under 10</p>
{/if}



<input bind:value={name} />

<h1>Hello {name}!</h1>