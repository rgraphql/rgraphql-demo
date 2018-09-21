/* tslint:disable-next-line */
/// <reference path="graphiql.d.ts" />

import GraphiQL from 'graphiql'
import { buildSchema, GraphQLSchema } from 'graphql';
import * as React from 'react';

import 'graphiql/graphiql.css'
import './App.css';

const schemaSrc = `
type RootQuery {
  person: Person
}

type Person {
  name: String
  age: Int
}

schema {
  query: RootQuery
}
`

interface IGraphQLFetcherParams {
  query: string
  operationName: string
  variables: {[key: string]: any} | undefined
}

async function graphQLFetcher(params: IGraphQLFetcherParams): Promise<any> {
  /* tslint:disable-next-line */
  console.log(params)
  return {
    data: params, // {},
    errors: [],
  }
}

class App extends React.Component {
  private schema: GraphQLSchema

  constructor(props: {}) {
    super(props)
    this.schema = buildSchema(schemaSrc)
  }

  public render() {
    return (
      <div className="App">
        <GraphiQL schema={this.schema} fetcher={graphQLFetcher} />
      </div>
    );
  }
}

export default App;
