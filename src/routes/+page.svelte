<script lang="ts">
    import type {Task, User} from "$lib/db-types";
    import {onDestroy, onMount} from "svelte";

    import Dialogue from "$lib/Dialogue.svelte";
    import {supa} from "$lib/setup-db";
    import DueDate from "$lib/DueDate.svelte";
    import type {RealtimeChannel} from "@supabase/supabase-js";

    let tasks: Task[] = [];
    let allUsers = new Map<string, User>();

    let subscription: RealtimeChannel | null = null;
    let filteredTasks: Task[] = [];

    $: filteredTasks = tasks.filter((task) => !task.done);

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
        allUsers = allUsers;

        console.log(allUsers);


        const allTasksRes = await supa.from('tasks').select(`*`);
        console.log(allTasksRes)
        if (allTasksRes.error) return;
        tasks = allTasksRes.data;


        // SUBSCRIBE TO CHANGES
        subscription = supa
            .channel('schema-db-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'tasks',
                },
                (payload) => {

                    if (payload.errors) {
                        console.log(payload);
                        return;
                    }

                    if (payload.eventType === "UPDATE") {
                        const updatedTask = payload.new as never as Task;
                        const index = tasks.findIndex((task) => task.id === updatedTask.id);
                        tasks[index] = updatedTask;
                        tasks = tasks;
                    } else if (payload.eventType === "DELETE") {
                        const deletedTask = payload.old as never as Task;
                        const index = tasks.findIndex((task) => task.id === deletedTask.id);
                        tasks.splice(index, 1);
                        tasks = tasks;
                    } else if (payload.eventType === "INSERT") {
                        const newTask = payload.new as never as Task;
                        tasks.push(newTask);
                        tasks = tasks;
                    }
                }
            )
            .subscribe();
    })

    onDestroy(() => {
        subscription?.unsubscribe();
    });


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

    let dialogueOpen = false;

    async function serverRequest(task: Task) {
        if (task.recurring) {
            const {error} = await supa
                .from('tasks')
                .insert({
                    assignee: null,
                    available: task.available,
                    availableByDefault: task.availableByDefault,
                    dueDate: (task.dueDate == null) ? null : offsetDate(task.recurrenceInterval),
                    done: false,
                    points: task.points,
                    title: task.title,
                    recurrenceInterval: task.recurrenceInterval
                })


            if (error) {
                alert("Error adding reccuring task");
                console.error(error);
                return;
            }
        }
        const {error} = await supa
            .from('tasks')
            .update({done: true})
            .eq('id', task.id)
        if (error) {
            alert("Error updating to done");
            console.error(error);
            return;
        }


    }

    function offsetDate(offset: number) {
        let result = new Date();
        result.setDate(result.getDate() + offset);
        return result.toISOString();
    }
</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app"/>
</svelte:head>

<h1>Tasks</h1>

<button on:click={() => dialogueOpen=true}>New Task</button>
<Dialogue allUsers={allUsers} bind:isOpen={dialogueOpen}/>
Dialogueopen: {dialogueOpen}
<table>
    <th>Points</th>
    <th>Task</th>
    <th>Assignee</th>
    {#each filteredTasks as task}
        <tr>
            <td>
                {task.points}
            </td>
            <td class="task-cont">
                <span>{task.title}</span>

                {#if task.dueDate}
                    <DueDate dueDate={task.dueDate}/>
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
            <td>
                <button on:click={()=>{serverRequest(task)}}>Done</button>
            </td>
        </tr>
    {/each}
</table>


<style>
    td {
        padding: 0.5rem;
        background-color: white;
    }

    table {
        max-width: 80%;
        width: 1000px;
        margin: auto;
    }

    .task-cont {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
</style>