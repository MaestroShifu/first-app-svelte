import Paho, { TypedArray, MQTTError, Message } from 'paho-mqtt';

interface ConfigClient {
  host: string;
  port?: number;
  path?: string;
  clientId?: string;
  hostUri?: string;
}

interface SendMessage {
  key: string;
  payload: string | ArrayBuffer | TypedArray;
}

interface OnConnect {
  key: string;
  onMessageArrived: (message: Message) => void;
}

export class ClientMQTT {
  private client: Paho.Client;

  constructor(config: ConfigClient) {
    const { host, port, path, clientId, hostUri } = config;
    if (port && path && clientId) {
      this.client = new Paho.Client(host, Number(port), path, clientId);
      return;
    }
    if (port && clientId) {
      this.client = new Paho.Client(host, Number(port), clientId);
      return;
    }
    if (hostUri && clientId) {
      this.client = new Paho.Client(hostUri, clientId);
      return;
    }
    throw new Error('Configuration parameters required');
  }

  public onConnect(args: OnConnect) {
    const { key, onMessageArrived } = args;

    const onSuccess = () => {
      console.log('Connection Successful');
      this.client.subscribe(key);
    };
    const onConnectionLost = (error: MQTTError) => {
      if (error.errorCode !== 0) {
        console.log(`Error connection: ${error.errorMessage}`);
      }
    };
    this.client.onConnectionLost = onConnectionLost;
    this.client.onMessageArrived = onMessageArrived;
    this.client.connect({ onSuccess });
  }

  public sendMessage(args: SendMessage) {
    const { key, payload } = args;
    const message = new Paho.Message(payload);
    message.destinationName = key;
    this.client.send(message);
  }
}
