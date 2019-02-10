import { createStore, combineReducers, __DO_NOT_USE__ActionTypes } from './lib/redux';
import logEvents from './modules/log-events'

const rootReducer = combineReducers({
    logEvents,
  })

const store = createStore(rootReducer);

export { store, __DO_NOT_USE__ActionTypes };
export * from './modules/log-events';
