# @iresine/core

@iresine/core is a library for normalize and notify about updates.

99% of the time, you shouldn't use @ iresine/core directly. At the moment, I
recommend using @iresine/core with
[@iresine/react-query](https://github.com/utftufutukgyftryidytftuv/iresine/tree/master/packages/react-query)

## Install

```
npm i @iresine/core
```

## API

##### type Entity = any

Entity that has an identifier

##### types EntityId = string

for this entity

```js
{
  id: '0',
  type: 'user'
}
```

entityId is

```js
'user:0';

```

##### type Template = Array<Array<string, any>>

Array of arrays where the first value contains the path, and the second value
contains the value

```js
const iresine = new Iresine();
const data = {
  deep: {
    level: {
      0: 'hello',
    },
  },
};

const {template} = iresine.parse(data);

// templte now have structure
// [
//  [[], {}], first array is structure of base
//  [['deep', 'level', '0'], 'hello']
// ]
```

##### type Refs = Map<Array<string>, EntityId>

Map, there keys are paths to the place where the link to another entity is
located. Values are the identifier of the entity we are referring to.

```js
const iresine = new Iresine();
const data = {
  deep: {
    level: {
      0: {
        id: 0,
        type: 'comment',
      },
    },
  },
};

const {refs} = iresine.parse(data);

// refs now have structure
// new Map([
//  [['deep', 'level', '0'], 'user:0']
// ])
```

##### parse(entity: Entity): {template: Template, refs: Refs}

The main function that parses data and stores it in storage. Upon completion, it
notifies all required subscribers.

##### get(EntityId: EntityId): Entity

Get an entity by its identifier

```js
const iresine = new Iresine();
const user = {
  id: '0',
  user: 'user',
};

iresine.parse(user);
iresine.get('user:0') === user; // true
```

##### join(EntityId: EntityId): Entity

Get an entity by its identifier. Unlike .get() creates a new entity when called.
The new entity is stored in the store.

```js
const iresine = new Iresine();
const user = {
  id: '0',
  user: 'user',
};

iresine.parse(user);
iresine.get('user:0') === user; // false, but have same structure
```

##### joinRefs(template: Template, refs: Refs)

Concatenates values from template, substituting entities from refs

```js
const iresine = new Iresine();
const data = {
  deep: {
    level: {
      0: {
        id: 0,
        type: 'comment',
      },
    },
  },
};

const {template, refs} = iresine.parse(data);
const joined = iresine.joinRefs(template, refs);
joined === data; // false, but have same structure
```

##### subscribe(EntityIds: []EntityId, listener)

Subscribes to changes.

##### unsubscribe(EntityIds: []EntityId, listener)

Unsubscribes to changes.
