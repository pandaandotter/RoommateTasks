<script lang="ts" xmlns="http://www.w3.org/1999/html">
    import type {Task, User} from "$lib/db-types";
    import {supa} from "$lib/setup-db.js";
    import {onMount} from "svelte";

    export let isOpen = false;

    async function serverRequest() {
        isOpen = false;

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
                recurrenceInterval: after,
                recurring: recurring
            })


        if (error) {
            alert("Error adding task");
            console.error(error);
            return;
        }

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
        title: "",
        recurrenceInterval: 7,
        recurring: false
    };

    let title = "";
    let points = 0;
    let due = false;
    let date_due: string | null = null;
    let recurring = false;
    let after = 0;
    let assignee: string | null = null;
    let available_default = true;

    let ref: HTMLInputElement

    $: if (isOpen) {
        setTimeout(() => {
            console.log("focus", ref)
            ref.focus();
        }, 100)
    }
</script>

{#if isOpen}
    <div style="background-color: rgba(0,0,0, .2); width: 100%; height: 100vh; z-index: 100000; position: absolute; left: 0; top: 0;" on:click={()=>isOpen=false}></div>
    <div style="z-index: 100001;" class="dialog" on:click={()=>{}}>
        <div class="flx">

            <input bind:value={title} bind:this={ref} placeholder="Title"/>
            <br>
            Points: <input type="number" bind:value={points} style="width: 35px;" >
            <br>
            <input type="checkbox" bind:checked={due}>due date?
            {#if due}
                <input type="date" bind:value={date_due}>
            {/if}
            <br>
            <input type="checkbox" bind:checked={recurring}>Reccuring?
            {#if recurring}
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
            <button id="cancel" on:click={() => isOpen = false}> Cancel</button>

        </div>
    </div>
{/if}
<style>
.dialog {
    background-color: white;
    width: 500px;
    max-width: 100%;
    height: 500px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    box-shadow: 0 0 10px rgba(0,0,0, .5);
}
</style>