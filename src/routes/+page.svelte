<script lang="ts">
    import {createClient} from '@supabase/supabase-js'
    import type {Database, Task, User} from "$lib/db-types";
    import {onMount} from "svelte";

    let tasks: Task[] = [];
    let allUsers = new Map<string, User>();
    onMount(async () => {
        const client = createClient<Database>(
            'https://mwakhqeticwltzxnyajr.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im13YWtocWV0aWN3bHR6eG55YWpyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDEzMzU3NTUsImV4cCI6MjAxNjkxMTc1NX0.EV_pDpb8F4popC49fGaN6dD3DqNuiakdrMaC7hq6oNc'
        )

        // FETCH ALL ROWS

        const allUsersRes = await client.from('profiles').select('*');
        if (allUsersRes.error) {
            alert("Error fetching users");
            console.error(allUsersRes.error);
            return;
        }

        allUsersRes.data.forEach((user) => {
            allUsers.set(user.id, user);
        });

        console.log(allUsers);

        const allTasksRes = await client.from('tasks')
            .select(`*`)
            .then((res) => {
                console.log(res)
                if (res.error) {
                    console.log(res.error)
                    return;
                }

                tasks = res.data as never as Task[];
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
                    if (payload.errors)
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

<table>
    {#each tasks as task}
        <tr>
            <td>
                {task.title}
            </td>
            <td>
                {task.assignee ? allUsers.get(task.assignee)?.first_name : "Unassigned"}

                <select>// specify key
                    {#each allUsers as user (user[1].id)}
                        {#if user[1].id === task.assignee}
                            <option value={user[1].id} selected>{user[1].first_name}</option>
                        {:else}
                            <option value={user[1].id}>{user[1].first_name}</option>
                        {/if}
                    {/each}
                    <option value={null} >Unassigned</option>
                </select>
            </td>
        </tr>
    {/each}
</table>

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