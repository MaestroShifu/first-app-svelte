<script>
  export let name;
  let buttonText = 'Button';
  const handleClick = () => {
    buttonText = 'Button Clicked';
  };
</script>

<h1>Hello {name}!</h1>
<button on:click={handleClick}>{buttonText}</button>
