<!--suppress TypeScriptValidateTypes -->
<script lang="ts">
    import {createClient} from '@supabase/supabase-js'
    import type {Database, Task} from "$lib/db-types";
    import {onMount} from "svelte";
    import type {User} from "$lib/db-types";

    let tasks: Task[] = [];
    let completedArr: Pair[] = [];
    let pointArr: Pair[] = [];

    interface Pair {
        name: string;
        count: number;
    }
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

        client
            .from("tasks")
            .select("*")

            .then((res) => {
                console.log(res)
                if (res.error) {
                    console.log(res.error)
                    return;
                }

                tasks = res.data


                let points = new Map();
                let completed = new Map();
                tasks.forEach((item: Task) => {
                    if (item.assignee == null) return;

                    let str = item.assignee.toString();
                    if (!points.has(str)) {
                        points.set(str, 0);
                        completed.set(str, 0);
                    }
                    points.set(str, points.get(str) + item.points);

                    if (item.done) completed.set(str, completed.get(str) + item.points);

                });

                for (const k of completed.entries()) {
                    completedArr.push({name: k[0], count: k[1]})
                }
                for (const k of points.entries()) {
                    pointArr.push({name: k[0], count: k[1]});
                }
                completedArr.sort((a, b) => b.count - a.count);
                pointArr.sort((a, b) => b.count - a.count);
                pointArr = pointArr;
                completedArr = completedArr;

            });


    })


</script>

<svelte:head>
    <title>Home</title>
    <meta name="description" content="Svelte demo app"/>
</svelte:head>
<div class="outer">

<h1>Roommates Ranking</h1>


{#each completedArr as person}
    <div class="row">
        <h2>{allUsers.get(person.name)?.first_name}</h2>
        {person.count}
    </div>
{/each}


<h1>Roommates Ranking With Pending Tasks</h1>


{#each pointArr as person}
    <div class="row">
        <h2>{allUsers.get(person.name)?.first_name}</h2>
        {person.count}
    </div>
{/each}

</div>

<style>
    .outer{
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: center;
    }
    .row {
        width: 400px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0 1rem;
        background-color: white;
        margin-bottom: 10px;
    }
    h1{
        width: 400px;
        display: flex;
        flex-direction: row;
    }
</style>