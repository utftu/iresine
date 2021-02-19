export default class ReactQuery {
  constructor(store, reactQueryClient) {
    const queries = reactQueryClient
      .getQueryCache()
      .findAll()
      .map((query) => [query.queryHash, query.state.data]);
  }

  listeners = new Map();

  add(query, data) {}
}
