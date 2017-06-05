import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {
  IRGQLClientMessage,
  IRGQLServerMessage,
  RGQLClientMessage,
  RGQLServerMessage,
} from 'rgraphql';
import {
  socketBusSoyuzInterface,
} from '../soyuz/client';
import {
  ISBConnectionStatus,
  ISBReconnectStatus,
  WebSocketClient,
} from './websocket-client';

@Injectable()
export class SocketBusService {
  public connectionStatus: BehaviorSubject<ISBConnectionStatus>;
  // Should we use JSON websocket frames (for debugging)
  private client: WebSocketClient;
  private lastConnectState: ISBConnectionStatus;
  private handlers: { [id: string]: (message: any) => void } = {};
  private isDisposed: boolean;

  // Create the client, start connect loop etc
  public init(server: string) {
    this.client = new WebSocketClient(server);
    this.client.start();
    this.connectionStatus = this.client.status;
    this.lastConnectState = this.connectionStatus.value;
    this.registerCallbacks();
    window['sbService'] = this;
    window['sioClient'] = this.client;
    if (window['socketBusDispose']) {
      window['socketBusDispose']();
    }
    window['socketBusDispose'] = () => {
      this.destroy();
    };
    socketBusSoyuzInterface.provideSocketBus(this);
  }

  public send(message: IRGQLClientMessage) {
    const encoded = RGQLClientMessage.encode(RGQLClientMessage.create(message)).finish();
    this.client.send(encoded);
  }

  public destroy() {
    this.isDisposed = true;
    this.client.stop();
  }

  private registerCallbacks() {
    this.client.messages.subscribe((data) => {
      const arr = new Uint8Array(<ArrayBuffer>data.data);
      const msg = RGQLServerMessage.decode(arr).toObject();
      socketBusSoyuzInterface.handleMessage(msg);
    });
  }
}
