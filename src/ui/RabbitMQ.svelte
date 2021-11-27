<script>
  import _ from 'lodash';
  import { ClientMQTT } from '../lib/paho';

  let message = undefined;

  const client = new ClientMQTT({
    host: 'test.mosquitto.org',
    port: Number(8080),
    clientId: 'daniel-12345',
  });

  client.onConnect({
    key: 'World',
    onMessageArrived: (message) => {
      console.log('onMessageArrived:' + message.payloadString);
    },
  });

  const debounceSubmit = _.debounce(() => {
    sendMessage();
  }, 500);

  const sendMessage = () => {
    client.sendMessage({
      key: 'World',
      payload: message,
    });
    message = undefined;
  };

  const onSubmit = () => {
    debounceSubmit();
  };

  $: message;
</script>

<main>
  <span>Uso del protocolo MQTT</span>
  <br />
  <form on:submit|preventDefault|stopPropagation={onSubmit}>
    <div>
      <label for="message">Message: </label>
      <input bind:value={message} type="text" id="message" name="message" />
    </div>
    <button type="submit">Click send message</button>
  </form>
</main>
