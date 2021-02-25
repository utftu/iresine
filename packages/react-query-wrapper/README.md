# @iresine/react-query-wrapper

`@iresine/react-query-wrapper` is the layer between `@iresine/core` and `react-query`.

## Install

```console
npm i @iresine/react-query-wrapper
```

## How use `@iresine/react-query-wrapper`?

`@iresine/react-query-wrapper` constructor waits instance of `@iresine/core` and instance `react-query` and then if the data has special fields for normalization, magic happens

### Example

```js
import IresineStore from 'packages/core/src/index';
import IresineReactQueryWrapper from '@iresone/react-query-wrapper';
import {QueryClient} from 'react-query';

const iresineStore = new IresineStore();
const queryClient = new QueryClient();
new IresineReactQueryWrapper(iresineStore, queryClient);
// now any updates in react-query will be consumbe by @iresine/core
```

if you now how `mobx` work, @iresine/core is like mobx and @iresone/react-query-wrapper like react-mobx
