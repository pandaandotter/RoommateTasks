<script>
	import Header from './Header.svelte';
	import './styles.css';
	import { browser } from '$app/environment'
	import { goto } from '$app/navigation'
	import { page } from '$app/stores'
	import { isSignedIn } from '$lib/is-signed-in'


	$: if (browser && !$isSignedIn && $page.url.pathname !== '/login') {
		console.log(
				'we are running in the browser, not signed in, and not on the sign in page, we are going to the sign in page'
		)
		goto('/login')
	} else if (browser && $isSignedIn && $page.url.pathname === '/login') {
		console.log(
				'we are running in the browser, signed in, and on the sign in page, we are going to the home page'
		)
		goto('/')
	}
</script>

<div class="app">
	<Header />

	<main>
		<slot />
	</main>


</div>

