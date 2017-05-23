import {
  BehaviorSubject,
} from 'rxjs/BehaviorSubject';
import {
  Subject,
} from 'rxjs/Subject';

const RECONNECT_INTERVAL = 3000;

export interface ISBConnectionStatus {
  connected: boolean;
  connecting: boolean;
  reconnectStatus?: ISBReconnectStatus;
}

export interface ISBReconnectStatus {
  attempt: number;
}

export class WebSocketClient {
  private attempts = 0;
  private reconnectStatus: ISBReconnectStatus = {attempt: 0};
  private statusSubject = new BehaviorSubject<ISBConnectionStatus>({
    connected: false,
    connecting: false,
    reconnectStatus: this.reconnectStatus,
  });
  private messageSubject = new Subject<MessageEvent>();
  private running = false;
  private sock: WebSocket;
  private reconnectInterval: any;

  constructor(private url: string) {
  }

  public get status(): BehaviorSubject<ISBConnectionStatus> {
    return this.statusSubject;
  }

  public get messages(): Subject<MessageEvent> {
    return this.messageSubject;
  }

  public start() {
    if (this.running) {
      return;
    }
    this.running = true;
    this.connect();
  }

  public send(message: any) {
    if (this.sock) {
      this.sock.send(message);
    }
  }

  public stop() {
    this.running = false;
    if (this.sock) {
      this.sock.close();
    }
    this.clearReconnect();
  }

  private connect() {
    this.sock = new WebSocket(this.url);
    this.sock.binaryType = 'arraybuffer';
    this.reconnectStatus.attempt++;
    this.statusSubject.next({
      connected: false,
      connecting: true,
      reconnectStatus: this.reconnectStatus,
    });
    this.sock.onopen = (event: Event): any => {
      this.statusSubject.next({
        connected: true,
        connecting: false,
        reconnectStatus: this.reconnectStatus,
      });
      this.reconnectStatus = {attempt: 0};
    };
    this.sock.onclose = (event: Event): any => {
      this.sock = null;
      this.statusSubject.next({
        connected: false,
        connecting: false,
        reconnectStatus: this.reconnectStatus,
      });
      this.reconnect();
    };
    this.sock.onmessage = (ev: MessageEvent): any => {
      this.messageSubject.next(ev);
    };
  }

  private reconnect() {
    this.clearReconnect();
    if (!this.running) {
      return;
    }
    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null;
      this.connect();
    }, RECONNECT_INTERVAL);
  }

  private clearReconnect() {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }
}
