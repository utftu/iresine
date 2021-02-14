export default class ReactQuery {
  constructor(store, reactQueryClient) {
    const queries = reactQueryClient
      .getQueryCache()
      .findAll()
      .map((query) => [query.options.queryHash, query.state.data]);
  }

  listeners = new Map();

  parse(query, data) {}

  subscribe(query, data) {}
}
