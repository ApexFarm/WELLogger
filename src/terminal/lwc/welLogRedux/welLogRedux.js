import { createStore, combineReducers } from './lib/redux';
import logEvents from './modules/log-events'

const rootReducer = combineReducers({
    logEvents,
  })

const store = createStore(rootReducer);

export { store };
export * from './modules/log-events';
