import {isPrimitive} from '@iresine/helpers';
import {setQueryDataNotCopy} from './helpers/index.js';

class ReactQueryWrapper {
  constructor(coreStore, queryClient) {
    this.coreStore = coreStore;
    this.queryClient = queryClient;
    queryClient
      .getQueryCache()
      .findAll()
      .forEach((query) => {
        if (isPrimitive(query.state.data)) {
          return;
        }
        this.add(query.queryHash, query.state.data);
      });

    queryClient.getQueryCache().subscribe(this.subscribeRequests);
  }

  queryClient = null;
  coreStore = null;
  store = new Map();
  settingQuery = false;

  add(query, data, queryKey) {
    const {template, refs} = this.coreStore.parse(data);
    const listener = () => {
      const newData = this.coreStore.joinRefs(template, refs);
      this.settingQuery = true;
      setQueryDataNotCopy(this.queryClient, queryKey, newData);
      this.settingQuery = false;
    };
    this.coreStore.subscribe(refs.values(), listener);
    this.store.set(query, {
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
    this.coreStore.unsubscribe([...queryMapState.refs.values()], queryMapState.listener);
    this.store.delete(query);
  }

  subscribeRequests = (queryState) => {
    if (this.settingQuery || !queryState) {
      return;
    }
    const query = queryState.query;
    if (isPrimitive(query.state.data)) {
      return;
    }
    this.remove(query.queryHash);
    this.add(query.queryHash, this.queryClient.getQueryData(query.queryKey), query.queryKey);
  };
}

export default ReactQueryWrapper;
