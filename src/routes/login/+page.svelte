<script lang="ts">
    import {supa} from "$lib/setup-db.js";

    let email = ''
    let password = ''

    async function login() {
        const res = await supa.auth.signInWithPassword({
            email,
            password,
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

<input type="email" bind:value={email}/>
<input type="password" bind:value={password}/>

<button on:click={login}>
    Submit
</button>