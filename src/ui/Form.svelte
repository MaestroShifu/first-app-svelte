<script lang="ts">
  import { ingredients, Ingredient } from '../domain/entities/ingredient';
  import { createProduct } from '../interfaces/product_interface';
  import _ from 'lodash';

  interface FormData {
    title: string;
    price: string;
    topping?: Ingredient;
  }

  const clearForm = () => ({
    title: '',
    price: '',
  });

  let formData: FormData = clearForm();

  const debounceSubmit = _.debounce(() => {
    createProductState();
  }, 500);

  const createProductState = () => {
    createProduct({
      ...formData,
      price: +formData.price,
      topping: Ingredient.chocolate,
    });
    formData = clearForm();
  };

  const onSubmit = () => {
    debounceSubmit();
  };

  $: formData;
</script>

<main>
  <div>
    <span>Formulario creacion de galletas</span>
  </div>

  <br />

  <form on:submit|preventDefault|stopPropagation={onSubmit}>
    <div>
      <label for="title">Nombre: </label>
      <input bind:value={formData.title} type="text" id="title" name="title" />
    </div>
    <div>
      <label for="price">Precio: </label>
      <input bind:value={formData.price} type="text" id="price" name="price" />
    </div>
    <div>
      <label for="topping">toppinge: </label>
      <select id="topping" name="topping" bind:value={formData.topping}>
        {#each Object.keys(ingredients) as ingredient}
          <option value={ingredient}>
            {ingredients[ingredient]}
          </option>
        {/each}
      </select>
    </div>
    <button type="submit">Guardar</button>
  </form>
</main>

<style>
</style>
