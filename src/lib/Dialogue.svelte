<script lang="ts" xmlns="http://www.w3.org/1999/html">
    import type {Task, User} from "$lib/db-types";

    let shows = false;
    async function serverRequest(){
        shows=false;

        const { error } = await supabase
            .from('tasks')
            .insert({assignee: assignee,     available: available_default,     availableByDefault: available_default,    dueDate:date_due,        points: points,     title:title})


        if (error) {
            alert("Error fetching users");
            console.error(error);
            return;
        }

    }
    function hide(){
        shows=false;}
    export let allUsers : Map<string,User>;
    let task: Task = {assignee: null,     available: false,     availableByDefault: false,     createdAt: "ah",     done: false,     dueDate:null,     id: 1,     points: 0,     title: null};

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
    Points:<input type="number" bind:value={points}>
    <input type="checkbox" bind:value={due}>due date?
    {#if due}
    <input type="date" bind:value={date_due}>Due Date
    {/if}
    <input type="checkbox" bind:value={reccuring}>Reccuring?
    {#if reccuring}
        <input type="number" bind:value={after}>days
    {/if}
    Assignee:
    <select bind:value={assignee}>// specify key
        {#each allUsers as user (user[1].id)}
            {#if user[1].id === task.assignee}
                <option value={user[1].id} selected>{user[1].first_name}</option>
            {:else}
                <option value={user[1].id}>{user[1].first_name}</option>
            {/if}
        {/each}
        <option value={null} >Unassigned</option>
    </select>
    Available per default?
    <input type="checkbox" bind:value={available_default}>


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