import {
  IRGQLServerMessage,
  IRGQLClientMessage,
  RGQLServerMessage,
  RGQLClientMessage,
} from 'rgraphql';
import * as pbjs from 'protobufjs';

let { decamelizeKeys, camelizeKeys } = require('xcase');

// Message wrapper.
interface ISocketBusMessage {
  // Base64 encoded proto.
  b?: string;
  // Client message
  jc?: IRGQLClientMessage;
  // Server message
  js?: IRGQLServerMessage;
}

export function EncodeSocketBusMessage(msg: IRGQLClientMessage,
                                       useJson: boolean,
                                       noCamelConvert = false): string {
  let sbm: ISocketBusMessage = {};
  if (useJson) {
    if (noCamelConvert) {
      sbm.jc = msg;
    } else {
      // This is slow, but in production we will use binary frames anyway.
      let obj = (<pbjs.Type>RGQLClientMessage).create(msg).toObject({
        longs: Number,
      });
      obj = decamelizeKeys(obj);
      sbm.jc = obj;
    }
  } else {
    let buf = (<pbjs.Type>RGQLClientMessage).encode(msg).finish();
    sbm.b = pbjs.util.base64.encode(buf, 0, buf.length);
  }
  return JSON.stringify(sbm);
}

export function DecodeSocketBusMessage(data: string): IRGQLServerMessage {
  let sbm: ISocketBusMessage = JSON.parse(data);
  if (sbm.b && sbm.b.length) {
    let len = pbjs.util.base64.length(sbm.b);
    let buf = pbjs.util.newBuffer(len);
    pbjs.util.base64.decode(sbm.b, buf, 0);
    sbm.js = (<pbjs.Type>RGQLServerMessage).decode(buf).toObject({
      longs: Number,
      bytes: Array,
    });
  } else if (sbm.js) {
    sbm.js = camelizeKeys(sbm.js);
  }
  return sbm.js;
}
