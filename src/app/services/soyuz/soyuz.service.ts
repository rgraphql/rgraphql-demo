import { Injectable } from '@angular/core';
import { SoyuzClient } from 'soyuz';

import { socketBusSoyuzInterface } from './client';

@Injectable()
export class SoyuzService {
  constructor() {}

  public get client(): SoyuzClient {
    return socketBusSoyuzInterface.soyuzClient;
  }
}
