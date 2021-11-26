<script>
  import Form from './ui/Form.svelte';
  import List from './ui/List.svelte';
  import ListPhotos from './ui/ListPhotos.svelte';
  import dayjs from 'dayjs';
  import utc from 'dayjs/plugin/utc';

  dayjs.extend(utc);

  const dateNow = dayjs().format();
  const dateNowUTC = dayjs().utc().format();
</script>

<main>
  <span class="date-now">Fecha con dayjs: {dateNow}</span>
  <br />
  <span class="date-now-utc">Fecha con dayjs UTC 0: {dateNowUTC}</span>
  <br />
  <Form />
  <br />
  <List />
  <br />
  <ListPhotos />
</main>

<style>
  .date-now {
    color: blue;
  }

  .date-now-utc {
    color: seagreen;
  }
</style>
