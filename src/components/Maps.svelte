<script lang="ts">
    import { createEventDispatcher, onMount, onDestroy } from 'svelte';
    import { latLng, pointMakers } from '../store/store';
    import { Loader } from '@googlemaps/js-api-loader';
    export let apiKey: string = ''; 

    let googleMaps: google.maps.Map | undefined;
    let isLoading: boolean = false;
    const dispatch = createEventDispatcher();
    const loader = new Loader({
        apiKey,
        version: 'weekly',
    });

    const changeLoadingStatus = (isLoadingState: boolean) => {
        isLoading = isLoadingState;
        dispatch('is-loading', {
			isLoading
		});
    };

    const latLngUnSub = latLng.subscribe(value => {
        if(!googleMaps) {
            return;
        }
        const centerPoint = new google.maps.LatLng(value.latitude, value.longitude);
        googleMaps.setCenter(centerPoint);
    });

    onMount(() => {
        if(!apiKey) {
            return;
        }
        loader.load().then(() => {
            googleMaps = new google.maps.Map(document.getElementById('map') as HTMLElement, {
                zoom: 15,
            });
            googleMaps.addListener('click', (event) => {
                const maker = event.latLng;
                new google.maps.Marker({
                    position: maker,
                    map: googleMaps
                });
                googleMaps.panTo(maker);
                pointMakers.update((makers) => {
                    return [
                        ...makers,
                        {
                            latitude: event.latLng.lat(),
                            longitude: event.latLng.lng(),
                            maker 
                        }
                    ]
                });
            });
            changeLoadingStatus(true);
        }).catch((err) => {
            console.error(err);
            changeLoadingStatus(false);
        });
    });

    onDestroy(() => {
        latLngUnSub();
    });

</script>

<main>
    <h1>Componente de mapa</h1>
    {#if apiKey}
        <div id="map"></div>
    {:else}
        <div class="error-mesage">
            <span>No se encontro una api key valida!!</span>
        </div>
    {/if}
</main>

<style>
    #map {
        height: 500px;
    }

    .error-mesage {
        color: red;
        font-size: 20px;
    }
</style>