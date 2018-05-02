import { createStore, combineReducers } from 'redux';
import warning from 'warning';

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

  const inject = (namespace, reducer, force = false) => {
    if (reducers[namespace] != null && !force) {
      warning(
        false,
        `Attempted to inject a new reducer in an already existing namespace ('${namespace}') without \`force\`. Skipping.`
      );
      return;
    }
    reducers[namespace] = reducer;
    replace();
  };

  const injectAll = (reducerMap, force = false) => {
    let hasChanged = false;
    Object.keys(reducerMap).forEach(namespace => {
      if (reducers[namespace] != null && !force) {
        warning(
          false,
          'Attempted to inject a new reducer in an already existing namespace without `force`. Skipping.'
        );
        return;
      }
      reducers[namespace] = reducerMap[namespace];
      hasChanged = true;
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
