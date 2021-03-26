import {isPrimitive} from '@iresine/helpers';
import {setQueryDataNotCopy} from './helpers/index.js';

class IresineReactQuery {
  constructor(coreStore, queryClient) {
    this.coreStore = coreStore;
    this.queryClient = queryClient;
    queryClient
      .getQueryCache()
      .findAll()
      .forEach((query) => {
        this.add(query.queryHash, query.state.data);
      });

    queryClient.getQueryCache().subscribe(this.subscribeRequests);
  }

  queryClient = null;
  coreStore = null;
  store = new Map();
  settingQuery = false;

  add(queryHash, data, queryKey) {
    const result = this.coreStore.parse(data);
    if (result === null) {
      return;
    }
    const {template, refs} = result;
    const listener = () => {
      const newData = this.coreStore.joinRefs(template, refs);
      this.settingQuery = true;
      setQueryDataNotCopy(this.queryClient, queryKey, newData);
      this.settingQuery = false;
    };
    this.coreStore.subscribe(refs.values(), listener);
    this.store.set(queryHash, {
      refs,
      template,
      listener,
    });
  }

  remove(query) {
    if (!this.store.has(query)) {
      return;
    }
    const queryMapState = this.store.get(query);
    this.coreStore.unsubscribe(
      [...queryMapState.refs.values()],
      queryMapState.listener
    );
    this.store.delete(query);
  }

  subscribeRequests = (queryEvent) => {
    if (queryEvent?.type !== 'queryUpdated') {
      return;
    }
    const query = queryEvent.query;

    this.remove(query.queryHash);
    this.add(query.queryHash, query.state.data, query.queryKey);
  };
}

export {IresineReactQuery};
export default IresineReactQuery;
