import { Injectable } from '@angular/core';
import { Logger } from 'angular2-logger/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {
  IRGQLClientMessage,
  IRGQLServerMessage,
} from 'rgraphql';
import {
  socketBusSoyuzInterface,
} from '../soyuz/client';
import {
  EncodeSocketBusMessage,
  DecodeSocketBusMessage,
} from './message';

import * as io from 'socket.io-client';

export interface IReconnectStatus {
  attempt: number;
}

export interface IConnectionStatus {
  connected: boolean;
  connecting: boolean;
  reconnectStatus?: IReconnectStatus;
}

@Injectable()
export class SocketBusService {
  public connectionStatus: BehaviorSubject<IConnectionStatus> =
    new BehaviorSubject<IConnectionStatus>({connected: false, connecting: true});
  // Should we use JSON websocket frames (for debugging)
  public useJSON = false;
  private client: SocketIOClient.Socket;
  private lastConnectState: IConnectionStatus;
  private handlers: { [id: string]: (message: any) => void } = {};
  private isDisposed: boolean;

  constructor(private log: Logger) {
  }

  // Create the client, start connect loop etc
  public init(server: string) {
    this.lastConnectState = this.connectionStatus.value;
    this.client = io(server);
    this.registerCallbacks();
    window['sbService'] = this;
    window['sioClient'] = this.client;
    if (window['socketBusDispose']) {
      window['socketBusDispose']();
    }
    window['socketBusDispose'] = () => {
      this.destroy();
    };
    if (window.localStorage && window.localStorage.getItem('enableJsonFrames')) {
      this.useJSON = true;
    }
    socketBusSoyuzInterface.provideSocketBus(this);
  }

  public send(message: IRGQLClientMessage) {
    let encoded = EncodeSocketBusMessage(message, this.useJSON);
    this.client.emit('sb', encoded);
  }

  public destroy() {
    this.isDisposed = true;
    this.client.close();
  }

  private registerCallbacks() {
    this.client.on('connect', (s: SocketIOClient.Socket) => {
      this.log.info('Socket bus connected.');
      this.connectionStatus.next({connected: true, connecting: false});
    });
    this.client.on('reconnecting', (cnt: number) => {
      this.connectionStatus.next({
        connected: false,
        connecting: true,
        reconnectStatus: {
          attempt: cnt,
        },
      });
    });
    this.client.on('disconnect', () => {
      this.connectionStatus.next({
        connected: false,
        connecting: false,
      });
    });
    this.client.on('error', (err: any) => {
      this.log.error(`Error in Socket.IO: ${err}`);
    });
    this.client.on('reconnect', (att: number) => {
      this.log.info(`Reconnected after ${att} attempts.`);
      this.connectionStatus.next({connected: true, connecting: false});
    });
    this.client.on('sb', (data) => {
      let msg = DecodeSocketBusMessage(data);
      socketBusSoyuzInterface.handleMessage(msg);
    });
  }
}
