<script lang="ts">
    import { onDestroy } from 'svelte';
    import { pointMakers, IMakers } from '../store/store';

    let makers: IMakers[] = [];

    const makerUnSub = pointMakers.subscribe((value) => {
        makers = [...value];
    });

    onDestroy(() => {
        makerUnSub();
    });

    $: makers;
</script>

<main>
    <h1>Lista de makers</h1>
    <table>
        <tr>
            <td> # </td>
            <td>latitude</td>
            <td>longitude</td>
        </tr>
        {#each makers as {latitude, longitude}, i}
            <tr>
                <td>{ i + 1 }</td>
                <td>{ latitude }</td>
                <td>{ longitude }</td>
            </tr>
	    {/each}
    </table>
</main>

<style>

</style>