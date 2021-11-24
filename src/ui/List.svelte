<script lang="ts">
  import { onDestroy } from 'svelte';
  import { Product } from '../domain/entities/product';
  import { ingredients } from '../domain/entities/ingredient';
  import { subscribeGlobalStore } from '../services/store/store';

  let products: Array<Product> = [];

  const { unSubscribe } = subscribeGlobalStore((state) => {
    products = [...state.products];
  });

  onDestroy(unSubscribe);

  $: products;
</script>

<main>
  <div>
    <span>Lista de Galletas</span>
  </div>
  <table>
    <tr>
      <th>Nombre</th>
      <th>Precio</th>
      <th>Ingrediente</th>
    </tr>
    {#each products as product}
      <tr>
        <td>{product.title}</td>
        <td>{product.price}</td>
        <td>{ingredients[product.topping]}</td>
      </tr>
    {/each}
  </table>
</main>

<style>
</style>
