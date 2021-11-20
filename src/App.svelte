<script lang="ts">
  import { ILatLng, latLng } from './store/store';
  import Maps from './components/Maps.svelte';
  import Table from './components/Table.svelte';

  let mapLoading = false;

  const handleLoadStatusMap = (event: CustomEvent<{ isLoading: boolean }>) => {
    mapLoading = event.detail.isLoading;
    const text = event.detail.isLoading
      ? 'Cargo el mapa de forma satisfactoria.'
      : 'No se pudo cargar el mapa.';
    alert(text);
  };

  const loadGeolocation = () => {
    if (!navigator.geolocation && !mapLoading) {
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const posGeo: ILatLng = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        latLng.set(posGeo);
      }
    );
  };

  $: {
    loadGeolocation();
  }
</script>

<main>
  <h1>App inicial</h1>
  <Maps apiKey="API_KEY" on:is-loading={handleLoadStatusMap} />
  <Table />
</main>

<style>
</style>
