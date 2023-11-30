<script lang="ts">
    import {createClient} from '@supabase/supabase-js'
    import type {Database, Task} from "$lib/db-types";
    import {onMount} from "svelte";

    let tasks: Task[] = [];
    onMount(() => {
        const client = createClient<Database>(
            'https://mwakhqeticwltzxnyajr.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13YWtocWV0aWN3bHR6eG55YWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDEzMzU3NTUsImV4cCI6MjAxNjkxMTc1NX0.EV_pDpb8F4popC49fGaN6dD3DqNuiakdrMaC7hq6oNc'
        )

        // FETCH ALL ROWS
        client
            .from("tasks")
            .select("*")
            .then((res) => {
                console.log(res)
                if(res.error) {
                    console.log(res.error)
                    return;
                }

                tasks = res.data
            });

        // SUBSCRIBE TO CHANGES
        client
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public.tasks',
                    table: 'tasks',
                },
                (payload) => {
                    if(payload.errors)
                    console.log(payload)
                }
            )
            .subscribe()
    })

</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app"/>
</svelte:head>


<h1>Tasks</h1>

{#each tasks as task}
    <div class="row">
        <h2>{task.title}</h2>
    </div>
{/each}
```

<style>
    .row {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0 1rem;
        background-color: white;
        margin-bottom: 10px;
    }
</style>