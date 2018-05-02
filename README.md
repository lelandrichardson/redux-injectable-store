# redux-injectable-store

Redux store with injectable reducers for use with bundle splitting, large apps, and SPAs.

## Motivation

It is often desirable to have a single "global" redux store in your application so it is easy for
reducers to listen and react to actions issued by disparate parts of the application. For sufficiently
large applications though, this becomes problematic because you then need to require all of the reducers
in your entire app at the time of creating your store. This gets more complicated once you start
bundle splitting, or lazily loading more JavaScript in the context of a SPA.

This library allows reducers to "inject" themselves into the store at any time, solving the above
problems.

## Installation

```js
npm i --save redux-injectable-store
```

## API

Right now, this module exports a single method: `createInjectableStore`. You can use in a CommonJS
environment:

ES6:
```js
import { createInjectableStore } from 'redux-injectable-store';
```

CommonJS:
```js
const createInjectableStore = require('redux-injectable-store').createInjectableStore;
```

`createInjectableStore` has the following API (extending [Redux's flow types](https://github.com/reactjs/redux/blob/master/flow-typed/redux.js))

```js

// This is your typical redux store (returned by `createStore(...)`
type ReduxStore<S, A> = {
  dispatch: Dispatch<A>;
  getState(): S;
  subscribe(listener: () => void): () => void;
  replaceReducer(nextReducer: Reducer<S, A>): void
};

// This is a new "injectable" store with some extra methods
type InjectableStore<S, A> = ReduxStore<S, A> & {
  inject(namespace: string, reducer: Reducer<S, A>, force: boolean = false),
  injectAll({ [key: string]: Reducer<S, A> }, force: boolean = false),
  clearReducers(),
};

function createInjectableStore<S, A>(
  preloadedState: S, 
  enhancer: StoreEnhancer<S, A>,
  wrapReducer: (Reducer<S, A>): Reducer<S, A> = Identity
): InjectableStore;
```

The `createInjectableStore` API follows the same API as Redux's `createStore`, but with the first
argument (`reducer`) missing, and an optional additional last argument, `wrapReducer`. The 
`wrapReducer` argument is a function that takes a reducer and returns a reducer. It is meant to allow
you to provide some global action handling if you need to.


## Usage

```js
// store.js

import { createInjectableStore } from 'redux-injectable-store';
import { applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import pack from 'redux-pack';

const initialState = getInitialStoreState(); // can also just be `{}`

// add whatever middleware you normally would (this is an example)
const enhancer = applyMiddleware(
  thunk,
  pack.middleware
);

const store = createInjectableStore({
  initialState,
  enhancer,
});

export default store;
```

```js
// SomeOtherFileA.js

import store from '../path/to/store';
import FooReducer from '../path/to/FooReducer';

store.inject('foo', FooReducer);
```

```js
// SomeOtherFileB.js

import store from '../path/to/store';
import BarReducer from '../path/to/BarReducer';
import QooReducer from '../path/to/QooReducer';

store.injectAll({
  bar: BarReducer,
  qoo: QooReducer,
});
```

## Additional Notes

1. If you try to inject a reducer into a namespace that already has a reducer without passing the 'force' argument, it will `console.warn` and be a "no op".


## License

[MIT](LICENSE)
