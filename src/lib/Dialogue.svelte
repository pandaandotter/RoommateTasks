<script lang="ts" xmlns="http://www.w3.org/1999/html">
    import type {Task, User} from "$lib/db-types";
    import {supa} from "$lib/setup-db.js";

    export let shows = false;


    async function serverRequest() {
        shows = false;

        const {error} = await supa
            .from('tasks')
            .insert({
                assignee: assignee,
                available: available_default,
                availableByDefault: available_default,
                dueDate: date_due,
                done: false,
                points: points,
                title: title,
                recurrenceInterval:after,
                recurring:reccuring
            })


        if (error) {
            alert("Error adding task");
            console.error(error);
            return;
        }

    }

    function hide() {
        shows = false;
    }

    export let allUsers: Map<string, User>;
    let task: Task = {
        assignee: null,
        available: false,
        availableByDefault: false,
        createdAt: "ah",
        done: false,
        dueDate: null,
        id: 1,
        points: 0,
        title: null,
        recurrenceInterval:7,
        recurring:false
    };

    let title = "title";
    let points = 0;
    let  due = false;
    let date_due: string | null = null;
    let reccuring = false;
    let after = 0;
    let assignee : string|null= null;
    let available_default = true;
</script>

export let allUs

<dialog id="myFirstDialog" open={shows} class="dia">



    <textarea bind:value={title}></textarea>
    <br>
    Points:<input type="number" bind:value={points}>
    <br>
    <input type="checkbox" bind:checked={due}>due date?
    {#if due}
    <input type="date" bind:value={date_due}>Due Date
    {/if}
    <br>
    <input type="checkbox" bind:checked={reccuring}>Reccuring?
    {#if reccuring}
        <input type="number" bind:value={after}>days
    {/if}
    <br>
    Assignee:
    <select bind:value={assignee}>
        {#each allUsers as user (user[1].id)}
            {#if user[1].id === task.assignee}
                <option value={user[1].id} selected>{user[1].first_name}</option>
            {:else}
                <option value={user[1].id}>{user[1].first_name}</option>
            {/if}
        {/each}
        <option value={null}>Unassigned</option>
    </select>
    <br>
    Available per default?
    <input type="checkbox" bind:checked={available_default}>

    <br>
    <button id="submit" on:click={serverRequest}>Add Task</button>
    <button id="cancel" on:click={hide}> cancel</button>
</dialog>




<style>
    .dia{
        width:50%;
        background-color:
                #F4FFEF;
        border:1px dotted black;
    }
</style>