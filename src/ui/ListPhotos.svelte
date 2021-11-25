<script lang="ts">
  import { getAllPhotos } from '../interfaces/photo_interface';
  import { Photo } from '../domain/entities/photo';

  let photos: Photo[] = [];

  $: {
    getAllPhotos().then((value) => {
      photos = [...value];
    });
  }
</script>

<main>
  <div>
    <span>Lista de photos</span>
  </div>
  <div class="container">
    {#each photos as photo}
      <div class="container-img">
        <img src={photo.thumbnailUrl} alt={photo.title} />
        <span class="title-img">{photo.title}</span>
      </div>
    {/each}
  </div>
</main>

<style>
  .container {
    display: flex;
    flex-flow: row wrap;
  }
  .container-img {
    width: 150px;
    margin: 1rem;
  }
  .title-img {
    width: 100%;
    text-overflow: ellipsis;
  }
</style>
