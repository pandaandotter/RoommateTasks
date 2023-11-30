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


        const allTasksRes = await supa.from('tasks').select(`*`).order('id', {ascending: true});
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

    async function serverDelete(task:Task){
        const { error } = await supa
            .from('tasks')
            .delete()
            .eq('id', task.id)
        if (error) {
            alert("Error deleting task");
        }
    }


    async function handleUpdateOfField(task: Task, fieldName: string) {
        const {data, error} = await supa
            .from('tasks')
            .update({[fieldName]: (task as never)[fieldName]})
            .match({id: task.id});

        if (error) {
            console.error('Error updating record:', error);
        } else {
            console.log('Record updated successfully:', data);
        }
    }

    let dialogueOpen = false;

    async function onDone(task: Task) {
        if (task.assignee === null) {
            task.assignee = supa.auth.getUser();
        }
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

<button class="new" on:click={() => dialogueOpen=true}>New Task</button>
<Dialogue allUsers={allUsers} bind:isOpen={dialogueOpen}/>
Dialogueopen: {dialogueOpen}
<table>
    <th>Points</th>
    <th>Task</th>
    <th>Assignee</th>
    {#each filteredTasks as task}
        <tr style="opacity: {task.available ? '100%' : '50%'}">
            <td>
                <input type="number" style="width: 3em" bind:value={task.points} on:change={()=>handleUpdateOfField(task, 'points')}>
            </td>
            <td>
                <div class="task-cont">
                    <input class="title-input" type="text" bind:value={task.title} on:change={()=>handleUpdateOfField(task, 'title')}>


                    {#if task.dueDate}
                        <DueDate dueDate={task.dueDate}/>
                    {:else}
                        <label style="user-select: none">
                            Available
                            <input type="checkbox" id="available" bind:checked={task.available}
                                   on:change={()=>handleUpdateOfField(task, 'available')}>
                        </label>
                    {/if}
                </div>
            </td>
            <td>
                <select bind:value={task.assignee} on:change="{()=>handleUpdateOfField(task, 'assignee')}">
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
                <button on:click={()=>{onDone(task)}} disabled={!task.available}>Mark Done</button>
                <button on:click={()=>{onDone(task)}} disabled={!task.available}>I Did It</button>
                <button class="del" on:click={()=>{serverDelete(task)}}>Delete</button>
            </td>
        </tr>
    {/each}
</table>


<style>
    td {
        padding: 0.5rem;
        background-color: white;
        height: 0;
    }

    table {
        max-width: calc(100% - 32px);
        width: 1000px;
        margin: auto;
    }

    .task-cont {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .new {
        --c:  #229091; /* the color*/
        position: relative;
        left:150px;
        bottom:100px;
        height:40px;
        width:100px;



        box-shadow: 0 0 0 .1em inset var(--c);
        --_g: linear-gradient(var(--c) 0 0) no-repeat;
        background:
                var(--_g) calc(var(--_p,0%) - 100%) 0%,
                var(--_g) calc(200% - var(--_p,0%)) 0%,
                var(--_g) calc(var(--_p,0%) - 100%) 100%,
                var(--_g) calc(200% - var(--_p,0%)) 100%;
        background-size: 50.5% calc(var(--_p,0%)/2 + .5%);
        outline-offset: .1em;
        transition: background-size .4s, background-position 0s .4s;
    }
    .new:hover {
        --_p: 100%;
        transition: background-position .4s, background-size 0s;
    }
    .new:active {
        box-shadow: 0 0 9em inset #0009;
        background-color: var(--c);
        color: #fff;
    }

    .del {
        --c:  #cc0000; /* the color*/
        box-shadow: 0 0 0 .1em inset var(--c);
        --_g: linear-gradient(var(--c) 0 0) no-repeat;
        background:
                var(--_g) calc(var(--_p,0%) - 100%) 0%,
                var(--_g) calc(200% - var(--_p,0%)) 0%,
                var(--_g) calc(var(--_p,0%) - 100%) 100%,
                var(--_g) calc(200% - var(--_p,0%)) 100%;
        background-size: 50.5% calc(var(--_p,0%)/2 + .5%);
        outline-offset: .1em;
        transition: background-size .4s, background-position 0s .4s;
    }
    .del:hover {
        --_p: 100%;
        transition: background-position .4s, background-size 0s;
    }
    .del:active {
        box-shadow: 0 0 9em inset #0009;
        background-color: var(--c);
        color: #fff;
    }

    .title-input{
        min-width: 0;
    }
</style>