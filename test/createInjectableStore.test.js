import { expect } from 'chai';

import { createInjectableStore } from '../src';

const initialState = {};

describe('createInjectableStore', () => {
  let store;

  beforeEach(() => {
    store = createInjectableStore(initialState);
  });

  it('returns a valid Redux store', () => {
    expect(store).to.have.property('getState');
    expect(store).to.have.property('dispatch');
    expect(store).to.have.property('subscribe');
    expect(store).to.have.property('replaceReducer');
  });
});
