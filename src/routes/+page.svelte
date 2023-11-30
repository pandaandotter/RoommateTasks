<script lang="ts">
    import type {Task, User} from "$lib/db-types";
    import {onMount} from "svelte";

    import Dialogue from "$lib/Dialogue.svelte";
    import {supa} from "$lib/setup-db";
    import DueDate from "$lib/DueDate.svelte";
    let tasks: Task[] = [];
    let allUsers = new Map<string, User>();


    onMount(async () => {


        // FETCH ALL ROWS

        const allUsersRes = await supa.from('profiles').select('*');
        if (allUsersRes.error) {
            alert("Error fetching users");
            console.error(allUsersRes.error);
            return;
        }

        allUsersRes.data.forEach((user) => {
            allUsers.set(user.id, user);
        });

        console.log(allUsers);


        const allTasksRes = await supa.from('tasks').select(`*`);
        console.log(allTasksRes)
        if (allTasksRes.error) return;
        tasks = allTasksRes.data;


        // SUBSCRIBE TO CHANGES
        supa
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


    async function handleAssignment(taskId: number, assigneeId: string | null) {
        console.log(taskId, assigneeId);

        console.log({assignee: assigneeId})
        const {data, error} = await supa
            .from('tasks')
            .update({assignee: assigneeId})
            .match({id: taskId});

        if (error) {
            console.error('Error updating record:', error);
        } else {
            console.log('Record updated successfully:', data);
        }
    }
</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app"/>
</svelte:head>

<h1>Tasks</h1>

<table>
    <th>Points</th>
    <th>Task</th>
    <th>Assignee</th>
    {#each tasks as task}
        <tr>
            <td>
                {task.points}
            </td>
            <td class="task-cont">
                <span>{task.title}</span>

                {#if task.dueDate}
                    <DueDate dueDate={task.dueDate} />
                {/if}

            </td>
            <td>
                <select bind:value={task.assignee} on:change="{()=>handleAssignment(task.id, task.assignee)}">
                    {#each allUsers as user (user[1].id)}
                        {#if user[1].id === task.assignee}
                            <option value={user[1].id} selected>{user[1].first_name}</option>
                        {:else}
                            <option value={user[1].id}>{user[1].first_name}</option>
                        {/if}
                    {/each}

                    <option value={null} selected={task.assignee === null}>???</option>
                </select>
            </td>
        </tr>
    {/each}
</table>

<Dialogue/>

<style>
    td {
        padding: 0.5rem;
        background-color: white;
    }
    .task-cont {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
</style>