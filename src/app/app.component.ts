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
import * as _ from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  public value: any;
  @ViewChild('reactCtr')
  private reactCtr: ElementRef;
  private query: ObservableQuery<any>;
  private querySub: Subscription;
  private lastQuery: string;
  private _querySrc: string;
  private _variablesSrc: string;
  private graphiqlInstance: any;

  private queryAst: graphql.DocumentNode;
  private queryVariables = {};

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
      this.queryAst = ast;
      this.initQuery();
      window.localStorage.setItem('lastQuery', value);
    } catch (e) {
      // do nothing
    }
  }

  get variablesSrc(): string {
    return this._variablesSrc;
  }

  set variablesSrc(value: string) {
    if (this._variablesSrc === value) {
      return;
    }
    this._variablesSrc = value;
    try {
      let varbs = JSON.parse(value);
      this.queryVariables = value;
      this.initQuery();
    } catch (e) {
      // Ignore
    }
  }

  constructor(public soyuzService: SoyuzService,
              public socketBusService: SocketBusService,
              private elRef: ElementRef) {
    socketBusService.init(environment.server);
    window['soyuzService'] = soyuzService;
  }

  public ngOnInit() {
    // The only thing that goes through fetcher is the introspection query.
    let fetcher = (params: any) => {
      let querySrc = params.query;
      let query = this.soyuzService.client.query<any>({
        query: graphql.parse(querySrc),
      });

      // We have no way to know when the query is done,
      // so let's just wait until it settles.
      return new Promise<any>((resolve, reject) => {
        let sub = query.subscribe(_.debounce((value) => {
          if (!value || !value.data || !value.data.__schema || !value.data.__schema.types) {
            return;
          }

          // Deep copy the result, since we immediately unsubscribe
          let dat = JSON.stringify(value);
          sub.unsubscribe();
          let pdat = JSON.parse(dat);
          console.log(pdat);
          resolve(pdat);
        }, 200));
      });
    };
    let ele = React.createElement(GraphiQL, {
      fetcher: fetcher,
      onEditQuery: (value: string) => {
        this.querySrc = value;
      },
      onEditVariables: (val: any) => {
        this.variablesSrc = val;
      },
    });
    this.graphiqlInstance = ReactDOM.render(ele, this.reactCtr.nativeElement);

    let sampleQuery = '{\r\n  allPeople {\n    name\n    steps\n  }\n}';
    let lastQuery = window.localStorage.getItem('lastQuery');
    if (lastQuery && lastQuery.length) {
      this.querySrc = lastQuery;
    } else {
      this.querySrc = sampleQuery;
    }
  }

  public initQuery() {
    if (this.query) {
      this.querySub.unsubscribe();
    }
    this.query = this.soyuzService.client.query<any>({
      query: this.queryAst,
      variables: this.queryVariables,
    });
    this.querySub = this.query.subscribe((value) => {
      this.value = value;
      if (this.graphiqlInstance) {
        this.graphiqlInstance.setState({
          response: JSON.stringify(value, null, 2),
        });
      }
    });
  }

  public stringify(val: any) {
    return JSON.stringify(val, null, 2);
  }
}
