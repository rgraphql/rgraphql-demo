import { Component } from '@angular/core';
import { SoyuzService } from './services/soyuz/soyuz.service';
import { SocketBusService } from './services/socket-bus/socket-bus';
import { environment } from '../environments/environment';
import { Subscription } from 'rxjs/Subscription';

import {
  ObservableQuery,
} from 'soyuz';

import * as graphql from 'graphql';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private query: ObservableQuery<any>;
  private querySub: Subscription;
  private lastQuery: string;
  private _querySrc;

  public value: any;

  get querySrc(): string {
    return this._querySrc;
  }

  set querySrc(value: string) {
    if (this._querySrc === value) {
      return;
    }
    this._querySrc = value;
    try {
      let ast = graphql.parse(value);
      this.initQuery(ast);
      window.localStorage.setItem('lastQuery', value);
    } catch (e) {
      // do nothing
    }
  }

  constructor(public soyuzService: SoyuzService,
              public socketBusService: SocketBusService) {
    socketBusService.init(environment.server);
    let sampleQuery = '{\r\n  allPeople {\n    name\n    steps\n  }\n}';
    let lastQuery = window.localStorage.getItem('lastQuery');
    if (lastQuery && lastQuery.length) {
      this.querySrc = lastQuery;
    } else {
      this.querySrc = sampleQuery;
    }
  }

  public initQuery(query: graphql.DocumentNode) {
    if (this.query) {
      this.querySub.unsubscribe();
    }
    this.query = this.soyuzService.client.query<any>({
      query: query,
    });
    this.querySub = this.query.subscribe((value) => {
      this.value = value;
    });
  }

  public stringify(val: any) {
    return JSON.stringify(val, null, 2);
  }
}
