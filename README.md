# iresine

## Description of the problem:

<img alt='problem' src='https://raw.githubusercontent.com/utftufutukgyftryidytftuv/iresine/b64d7df3babb80d4493d33447cd465bc4c1062dd/static/irsene-problem.svg'/>
<br/> Imagine this
sequence:

1. The client application requests a list of users with a request to /users and it gets users with id from 1 to 10
2. User with id 3 changes his name
3. The client application requests the user with id 3 using a request to /user/3

**Question:** What is the username with id 3 in the application? <br/> **Answer:**
Depends on the component that requested the data. In a component that uses
data from the request to /users, the old name will be displayed. In a component that
uses the data from the request to /user/3, the new name will be displayed.

**Conclusion**: In this case, there are several entities of the same meaning with different data sets in the system.

**Question:** Why is that bad? <br/> **Answer:** At best user
will see different names of one person in different sections of the site, at worst translate
money for old bank details.

## Solution options

Currently, there are the following solutions to this problem:
- Not to pay attention
- Normalize data with your own hand
- Use graphql client (apollo or relay)

### Not to pay attention

This is the most obvious and tempting option. In some cases, the client
the app can really afford to have the same entities with
different data. But what about when this is unacceptable behavior?
How to deal with developers who do not want to create an application with such
defects?

### Normalize data with your own hand

An example of a handwritten implementation is the code for mobx:

```js
class Store {
  users = new Map();

  async getUsers() {
    const users = await fetch(`/users`);
    users.forEach((user) => this.users.set(user.id, user));
  }

  async getUser(id) {
    const user = await fetch(`/user/${id}`);
    this.users.set(user.id, user);
  }
}
```

And if the example with mobx looks acceptable, then normalization in redux is simply
[terrifying](https://redux.js.org/recipes/structuring-reducers/normalizing-state-shape).
Working with such code becomes more difficult as it grows and completely
not interested.

### Use graphql client (apollo or relay)

Apollo and relay are libraries that can normalize data out of the box.
However, such a solution forces us to use graphql and apollo, which, according to
in my opinion, they have many disadvantages.

### Normalization

What is normalization and how does it allow graphql clients to deal with the specified
problem? Let's take a look at the apollo example! This is how apollo describes his actions with
data:

> ...**normalizes** query response objects before it saves them to its internal
> data store.

What does the specified _normalize_ include?

> Normalization involves the following steps:
>
> 1. The cache generates a unique ID for every identifiable object included in
>    the response.
> 2. The cache stores the objects by ID in a flat lookup table.

That is, apollo generates a unique identifier for each entity, for
which it is possible to form it. Apollo uses it as a key to store all entities.
This is how the formation of an identifier and its storage looks roughly:

```js
const store = new Map();

const user = {
  id: '0',
  type: 'user',
  name: 'alex',
  age: 24,
};

const id = `${user.type}:${user.id}`;

store.set(id, user);
```

The combination of type and id gives us a truly unique key. We can be
are sure that if we meet another user with the same type and id, then this
will be the same user.

## Getting a unique identifier

Apollo achieves the specified effect by querying the internal
field __typename, but how to achieve a similar effect without graphql?

Since we have no internal fields with types, we should only rely on
data fields. Here are some solutions:

- make id or similar field globally unique
- add information about entity types to data
  - add types on the server
  - add types on the client

### Make field globally unique

In this case, the storage of entities will look like this:

```js
const store = new Map();

const user = {
  id: '0',
};

const comment = {
  id: '1',
};

store.set(user.id, user);
store.set(comment.id, comment);

// ...

store.get('0'); // user
store.get('1'); // comment
```

The solution looks pretty easy to use, but implementing globally unique id fields will be difficult. 
As a rule, entities are stored in a database and have a unique id only within a collection/table (or in other words of some type).
This means that it takes a lot of effort to make the id globally unique.

### Add information about entity types to data

In this case, the storage of entities looks like this:

```js
const store = new Map();

const user = {
  id: '0',
  type: 'user', // <-- new field
};

const comment = {
  id: '1',
  type: 'comment', // <-- new field
};

function getStoreId(entity) {
  return `${entity.type}:${entity.id}`;
}

store.set(getStoreId(user), user);
store.set(getStoreId(comment), comment);

// ...

store.get('user:0'); // user
store.get('comment:1'); // comment
```

It is still convenient, but it requires us to add a special field in the data.
It seems to me that this small sacrifice pays off with the ability to automatically track changes in the data.
It was this option that I chose as preferable for myself.

### Where to add types to data?

The problem of data normalization is especially common in client applications.
Therefore, consider the question - at what point to add information about types to data?
We can choose one of the above options to add types.

- On the server, when sending data:

```js
app.get('/users', (req, res) => {
  const users = db.get('users');
  const typedUsers = users.map((user) => ({
    ...user,
    type: 'user',
  }));
  res.json(typedUsers);
});
```

- On the client, when receiving data:

```js
function getUsers() {
  const users = fetch('/users');
  const typedUsers = users.map((user) => ({
    ...user,
    type: 'user',
  }));
  return typedUsers;
}
```

As it seems to me, the option of adding data on the server is preferable.
Api, which gives data, knows what data and what type it is giving.
However, in some cases it is not possible to change the server code to give 
the type, in such cases you can add types on the client.

Now let's figure out how to automate all this.

## iresine

`iresine` is a library designed to normalize data and alert when it changes.

Iresine currently consists of the following modules:

- @iresine/core
- @iresine/react-query

This is how iresine works with react-query:

<img alt='iresine-structure' src='https://raw.githubusercontent.com/utftufutukgyftryidytftuv/iresine/9e1cca578ea0723b731a2e7c187f443d01b31337/static/iresine-solve-problem.svg'/>

### [@iresine/core](https://github.com/utftufutukgyftryidytftuv/iresine/tree/master/packages/core)

The main module of the library, it is it that is responsible for parsing data, normalizing it and 
notifying subscribers about a change in a specific entity.

```js
const iresine = new Iresine();
const oldRequest = {
  users: [oldUser],
  comments: {
    0: oldComment,
  },
};
// new request data have new structure, but it is OK to iresine
const newRequest = {
  users: {
    0: newUser,
  },
  comments: [newComment],
};

iresine.parse(oldRequest);
iresine.parse(newRequest);

iresine.get('user:0' /*identifier for old and new user*/) ===
  newRequest.users['0']; // true
iresine.get('comment:0' /*identifier for old and new comment*/) ===
  newRequest.comments['0']; // true
```

As you can see from the identifiers by which we get entities from the storage, 
@iresine/core uses the following scheme to create identifiers:

```js
entityType + ':' + entityId;
```

By default, @iresine/core takes the type from the `type` field, and the id from the` id` field. 
This behavior can be changed by passing in your own functions. 
For example, let's try to use the same identifier as in apollo:

```js
const iresine = new Iresine({
  getId: (entity) => entity.id,
  getType: (entity) => entity.__typename,
});
```

We can also handle the globally unique id field with a little hack:

```js
const iresine = new Iresine({
  getId: (entity) => entity.id,
  getType: (entity) => entity.id,
});
```

What does @iresine/core do with entities where no identifier is found?
For example like this:

```js
const user = {
  id: '0',
  type: 'user',
  jobs: [
    {
      name: 'milkman',
      salary: '1$',
    },
    {
      name: 'woodcutter',
      salary: '2$',
    },
  ],
};
```

User has its own identifier in the storage, but what about jobs? They have neither a type nor an id field!
@iresine/core follows a simple rule: if an entity has no identifier, then it becomes part of the closest parent 
entity with an identifier.

@resine/core is a generic library that knows how to parse data and point out subscribers.
But using it directly is rather tedious and tedious. Let's see how to make this process more convenient!

### [@iresine/react-query](https://github.com/utftufutukgyftryidytftuv/iresine/tree/master/packages/react-query)

react-query is a great library that I would encourage everyone to familiarize themselves with. 
But it lacks data normalization, and it was this fact that inspired me to write iresine.

@iresine/react-query is a plugin for react-query.
It allows you to use the normalization function and update data in the react-query storage.
All normalization work happens automatically and the client works with react-query as it would work without iresine.

```js
import Iresine from '@iresine/core';
import IresineReactQuery from '@iresone/react-query';
import {QueryClient} from 'react-query';

const iresineStore = new IresineStore();
const queryClient = new QueryClient();
new IresineReactQueryWrapper(iresineStore, queryClient);
// now any updates in react-query store will be consumbed by @iresine/core
```

The interaction scheme looks like this (it was given above):

<img alt='iresine-structure' src='https://raw.githubusercontent.com/utftufutukgyftryidytftuv/iresine/9e1cca578ea0723b731a2e7c187f443d01b31337/static/iresine-solve-problem.svg'/>

## Resume

Normalizing data on the client is a problem. Now it is being solved in different ways with varying degrees of success.
In the material written above, the author offers his own way to solve this problem.If you shorten the whole sentence 
to a few words, they will sound like **_add type information to the data, and then use [iresine](https://github.com/utftufutukgyftryidytftuv/iresine)_**
