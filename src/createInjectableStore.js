import { createStore, combineReducers } from 'redux';
import has from 'has';

const FAKE_INITIAL_REDUCER_NAMESPACE = '___';
const IDENTITY_REDUCER = (state = null) => state;

const defaultWrapReducer = reducer => reducer;

const makeEmptyReducerMap = () => ({
  // putting this here because `combineReducers` will complain if there isn't at least
  // one reducer initially.
  [FAKE_INITIAL_REDUCER_NAMESPACE]: IDENTITY_REDUCER,
});

const createInjectableStore = (preloadedState, enhancer, wrapReducer = defaultWrapReducer) => {
  let reducers = makeEmptyReducerMap();
  const store = createStore(wrapReducer(combineReducers(reducers)), preloadedState, enhancer);

  const replace = () => {
    store.replaceReducer(wrapReducer(combineReducers(reducers)));
  };

  const clearReducers = () => {
    reducers = makeEmptyReducerMap();
  };

  const injectSingleReducer = (namespace, reducer) => {
    if (has(reducers, namespace)) {
      if (reducers[namespace] !== reducer) {
        throw new ReferenceError(
          `Attempted to inject reducer '${namespace}' but it already exists.`
        );
      }
      return false;
    }
    reducers[namespace] = reducer;
    return true;
  };

  const inject = (namespace, reducer) => {
    if (injectSingleReducer(namespace, reducer)) {
      replace();
    }
  };

  const injectAll = reducerMap => {
    const hasChanged = Object.keys(reducerMap).every(namespace => {
      return injectSingleReducer(namespace, reducerMap[namespace]);
    });
    if (hasChanged) {
      replace();
    }
  };

  return {
    ...store,
    inject,
    injectAll,
    clearReducers,
  };
};

module.exports = createInjectableStore;
