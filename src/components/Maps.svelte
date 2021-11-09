<script lang="ts">
    import { Loader } from '@googlemaps/js-api-loader';
    export let apiKey: string = ''; 

    const loader = new Loader({
        apiKey,
        version: 'weekly',
    });

    loader.load().then(() => {
        new google.maps.Map(document.getElementById('map') as HTMLElement, {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8,
        });
    });
</script>

<main>
    <h1>Componente de mapa</h1>
    <div id="map"></div>
</main>

<style>
    #map {
        height: 500px;
    }
</style>