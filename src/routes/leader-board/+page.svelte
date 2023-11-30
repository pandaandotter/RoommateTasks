<!--suppress TypeScriptValidateTypes -->
<script lang="ts">
	import {createClient} from '@supabase/supabase-js'
	import type {Database, Task} from "$lib/db-types";
	import {onMount} from "svelte";
	let tasks: Task[] = [];
	let completedArr: Pair[] = [];
	let pointArr:Pair[]= [];

	interface Pair {
		name : string;
		count : number;
	}
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



					let points= new Map();
					let completed =new Map();
					tasks.forEach(sum);
					function sum(item:Task){
						if(item.assignee!=null){
							let str = item.assignee.toString();
							if(!points.has(str)) {
								points.set(str, 0);
								completed.set(str, 0);
							}
							points.set(str,points.get(str)+item.points);
							if(item.done){
								completed.set(str,completed.get(str)+item.points);
							}
						}
					}





					for(const k of completed.entries()){
						completedArr.push({name:k[0],count:k[1]});
					}
					for(const k of points.entries()){
						pointArr.push({name:k[0],count:k[1]});
					}
					pointArr.sort((a,b)=>b.count-a.count);
					completedArr.sort((a,b)=>b.count-a.count);
					pointArr=pointArr;
					completedArr=completedArr;
				});





	})




</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app"/>
</svelte:head>


<h1>Roommates Ranking</h1>


{#each tasks as task}
	<div class="row">
		<h2>{task.title}</h2>
	</div>
{/each}

{#each pointArr as person}
	<div class="row">
		<h2>{person.name}</h2>
		{person.count}
	</div>
{/each}




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