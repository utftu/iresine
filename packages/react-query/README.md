# @iresine/react-query

@iresine/react-query is the layer between
[@iresine/core](https://github.com/utftufutukgyftryidytftuv/iresine/tree/master/packages/core)
and [react-query](https://github.com/tannerlinsley/react-query).

@iresine/react-query must be used along with
[@iresine/core](https://github.com/utftufutukgyftryidytftuv/iresine/tree/master/packages/core).

## Install

```
npm i @iresine/react-query
```

## Example

```js
import IresineStore from '@iresine/core';
import IresineReactQuery from '@iresone/react-query';
import {QueryClient} from 'react-query';

const iresine = new Iresine();
const queryClient = new QueryClient();
new IresineReactQuery(iresineStore, queryClient);
```
