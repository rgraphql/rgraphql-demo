import {
  SoyuzClient,
  ITransport,
} from 'soyuz';
import { SocketBusService } from '../socket-bus/socket-bus';
import {
  IRGQLServerMessage,
  IRGQLClientMessage,
} from 'rgraphql';

// Using a hack here. We have to create the client BEFORE angular2 is set up,
// but we can't use socketbus until then. Thus, batch up all the requests and
// send them after SocketBus is set up AND it's ready for queries (user ctx inited).

export class SocketBusTransport implements ITransport {
  public soyuzClient: SoyuzClient;

  private socketBus: SocketBusService;
  private socketBusConnected: boolean;

  private handleMessageCb: (mes: IRGQLServerMessage) => void;

  constructor() {
    this.soyuzClient = new SoyuzClient();
  }

  // Soyuz will call this function with a callback function for handling messages.
  public onMessage(cb: (mes: IRGQLServerMessage) => void): void {
    this.handleMessageCb = cb;
  }

  // Soyuz will call this function with outgoing messages for the server.
  public send(msg: IRGQLClientMessage) {
    if (!this.socketBus) {
      return;
    }
    this.socketBus.send(msg);
  }

  public handleMessage(message: IRGQLServerMessage) {
    if (this.handleMessageCb) {
      this.handleMessageCb(message);
    }
  }

  public provideSocketBus(service: SocketBusService) {
    if (this.socketBus) {
      return;
    }
    this.socketBus = service;
    this.send = service.send.bind(service);
    this.socketBus.connectionStatus.subscribe((state) => {
      if (state.connected) {
        if (this.socketBusConnected) {
          return;
        }
        this.onSocketBusConnected();
      } else {
        if (!this.socketBusConnected) {
          return;
        }
        this.onSocketBusDisconnected();
      }
    });
  }

  private onSocketBusConnected() {
    this.socketBusConnected = true;
    this.soyuzClient.setTransport(this);
  }

  // Close everything and go to pre-socketbus mode
  private onSocketBusDisconnected() {
    this.socketBusConnected = false;
    this.soyuzClient.setTransport(null);
  }
}

export const socketBusSoyuzInterface = new SocketBusTransport();
