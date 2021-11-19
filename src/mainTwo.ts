import AppTwo from './AppTwo.svelte';

const appTwo = new AppTwo({
  target: document.body,
  props: {
    name: 'World',
  },
});

export default appTwo;
