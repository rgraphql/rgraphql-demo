import { Component } from '@angular/core';
import { SoyuzService } from './services/soyuz/soyuz.service';
import { SocketBusService } from './services/socket-bus/socket-bus';
import { environment } from '../environments/environment';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

declare var require: Function;
let GraphiQL: any = require('graphiql');

import {
  ObservableQuery,
} from 'soyuz';

import * as graphql from 'graphql';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public value: any;
  public graphiqlValue = new BehaviorSubject<any>(null);
  @ViewChild('reactCtr')
  private reactCtr: ElementRef;
  private query: ObservableQuery<any>;
  private querySub: Subscription;
  private lastQuery: string;
  private _querySrc: string;

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
              public socketBusService: SocketBusService,
              private elRef: ElementRef) {
    socketBusService.init(environment.server);
    let sampleQuery = '{\r\n  allPeople {\n    name\n    steps\n  }\n}';
    let lastQuery = window.localStorage.getItem('lastQuery');
    if (lastQuery && lastQuery.length) {
      this.querySrc = lastQuery;
    } else {
      this.querySrc = sampleQuery;
    }
  }

  public ngOnInit() {
    let fetcher = (params: any) => {
      console.log('Fetcher, params:');
      console.log(params);
      this.querySrc = params.query;
      return this.graphiqlValue;
    };
    let ele = React.createElement(GraphiQL, {
      fetcher: fetcher,
    });
    ReactDOM.render(ele, this.reactCtr.nativeElement);
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
      this.graphiqlValue.next(value);
    });
  }

  public stringify(val: any) {
    return JSON.stringify(val, null, 2);
  }
}
