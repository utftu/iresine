# @iresine/core

`@iresine/core` is a JavaScript library for manage and sync data.

## What problem does `@iresine/core` solve?

1. Make request for users with id from 1 to 10
2. User with id: 3 change name
3. Make request for user with id: 3
4. Ooops, now in our system exists old user in first request data and new user
   in second request data

## Install

```console
npm i @iresine/core
```

## How use `@iresine/core`?

In most cases it uses with other wrapper libraries and make main work to
normalize data

### Example

```js
import IresineStore from 'packages/core/src/index';
import IresineReactQueryWrapper from '@iresone/react-query-wrapper';
import {QueryClient} from 'react-query';

const iresineStore = new IresineStore();
const queryClient = new QueryClient();
new IresineReactQueryWrapper(iresineStore, queryClient);
// now iresine work
```

if you now how `mobx` work, @iresine/core is like mobx and
@iresone/react-query-wrapper like react-mobx

## How is the data normalized?

For normalization, entities must have an `id` and a `type` within which the id
will be unique. `id` and `type` is default fields that are used to define a key
for data normalization. You can change this fields to do like apollo `_id` and
`__typename`

## Examples

```js
import IresineStore from 'packages/core/src/index';

const iresineStore = new IresineStore();

const oldUser = {
  id: '0',
  type: 'user',
  name: 'oldName',
};

const newUser = {
  id: '0',
  type: 'user',
  name: 'newName',
};

iresineStore.parse(oldUser);
// work with different structures
iresineStore.parse([[[[[newUser]]]]]);

iresineStore.get('user:0').name; // newName
```

## Limitation

- data have to be "JSONed", `@iresine/core` don't work with Map, Set ...etc
