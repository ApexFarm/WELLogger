import { createStore, combineReducers, applyMiddleware, __DO_NOT_USE__ActionTypes } from './lib/redux';
import thunk from './lib/redux-thunk';
import logEvents from './modules/log-events'

const rootReducer = combineReducers({
    logEvents
});

const store = createStore(rootReducer, applyMiddleware(thunk));

export { store, __DO_NOT_USE__ActionTypes };
export * from './modules/log-events';