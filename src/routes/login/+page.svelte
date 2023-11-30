<script lang="ts">
    import {setupClient} from "$lib/setup-db";

    const client = setupClient();

    async function login() {
        const res = await client.auth.signInWithPassword({
            email: 'example@email.com',
            password: 'example-password'
        })

        if (res.error) {
            alert(res.error.message)
            return
        }
        window.location.href = '/'
    }
</script>
<svelte:head>
    <title>Login</title>
    <meta name="description" content="Svelte demo app"/>
</svelte:head>

<h1>Log In</h1>

<input type="email"/>
<input type="password"/>

<button on:click={login}>
    Submit
</button>