# @iresine/core

`@iresine/core` is a library for normalize and notify about updates.

## @iresine/core API

##### types StoreId = string
Идентификатор сущности

for this entity
```js
{
  id: '0',
  type: 'user'
}
```
storeId is
```js
'user:0'
```

##### type Template = Array<Array<string, any>>
Массив массивов, где в первом значении находится путь, а во втором значение

```js
const iresine = new Iresine()
const data = {
   deep: {
     level: {
       0: 'hello'
     }
   }
}

const {template} = iresine.parse(data)

// templte now have structure 
// [
//  [[], {}], first array is structure of base
//  [['deep', 'level', '0'], 'hello']
// ]
```

##### type Refs = Map<Array<string>, string>

refs is map. Ключи в ней служат путями к месту, где располагается ссылка на другую сущность. Значения это идентификатора сущности на который ссылаемся.

```js
const iresine = new Iresine()
const data = {
   deep: {
     level: {
       0: {
          id: 0,
          type: 'comment'
       },
       1: 'hello'
     }
   }
}

const {refs} = iresine.parse(data)

// refs now have structure 
// new Map([
//  [['deep', 'level', '0'], 'user:0']
// ])
```

##### Entity = any
Сущность, которая имеет идентификатор

##### parse(entity: Entity): {template: Template, refs: Refs}
Основная функция, которая разбирает данные и сохраняет их в хранилище. 
По завершению она уведомляет всех необходимых подписчиков.

##### get(storeId: StoreId): Entity
Получение сущности по ее идентификатору

```js
const iresine = new Iresine()
const user = {
  id: '0',
  user: 'user'
}

iresine.parse(user)
iresine.get('user:0') === user // true
```

##### join(storeId: StoreId): Entity
Получение сущности по ее идентификатору. В отличие от .get() создает новую сущность при вызове. 
Новая сущность сохраняется в хранилище.

```js
const iresine = new Iresine()
const user = {
  id: '0',
  user: 'user'
}

iresine.parse(user)
iresine.get('user:0') === user // false, but have same structure
```


##### joinRefs(template: Template, refs: Refs)
Соединяет значения из template, подставляя сущности из refs



##### subscribe(storeIds: []StoreId, listener)
Подписывается на изменения указанных сущностей.

##### unsubscribe(storeIds: []StoreId, listener)
Отписывается на изменения указанных сущностей.

## What problem does `@iresine/core` solve?

1. Make request for users with id from 1 to 10
2. User with id: 3 change name
3. Make request for user with id: 3
4. Ooops, now in our system exists old user in first request data and new user
   in second request data

## Install

```
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
