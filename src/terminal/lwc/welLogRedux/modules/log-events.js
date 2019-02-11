import getUser from '@salesforce/apex/WELLogController.getUser';
import produce from '../lib/immer';
import { selectColor } from '../lib/colors';

const RECIEVE_LOGS = 'wel/log-events/RECIEVE_LOGS';
const FILTER_BY_ERRORS = 'wel/log-events/FILTER_BY_ERRORS';
const FILTER_BY_WARNINGS = 'wel/log-events/FILTER_BY_WARNINGS';
const SELECT_MODULE = 'wel/log-events/SELECT_MODULE';
const SELECT_USER = 'wel/log-events/SELECT_USER';
const CLEAR_ALL = 'wel/log-events/CLEAR_ALL';
const UPDATE_USER_OPTIONS = 'wel/log-events/UPDATE_USER_OPTIONS';
const UPDATE_MODULE_OPTIONS = 'wel/log-events/UPDATE_MODULE_OPTIONS';

let userCache = {};
let moduleCache = {};
const namespaceColorCache = {};

const __ANY_USER__ = '-- Any User --';
const __ANY_MODULE__ = '-- Any Module --';
const initUserOptions = [{ value: __ANY_USER__, text: __ANY_USER__ }];
const initModuleOptions = [{ value: __ANY_MODULE__, text: __ANY_MODULE__ }];
const initState = {
    items: [],
    errors: 0,
    warnings: 0,
    userOptions: initUserOptions,
    moduleOptions: initModuleOptions,
    filters: {
        userId: __ANY_USER__,
        module: __ANY_MODULE__,
        errorsOnly: false,
        warningsOnly: false
    }
};

export default function reducer(state = initState, action = {}) {
    return produce(state, draft => {
        switch (action.type) {
            case RECIEVE_LOGS: {
                let eventLog = action.payload;
                draft.items.push(eventLog);

                if ((draft.filters.module === __ANY_MODULE__
                    || draft.filters.module === eventLog.module)
                    && (draft.filters.userId === __ANY_USER__
                    || draft.filters.userId === eventLog.createdById)) {
                    if (eventLog.level === 'E') {
                        draft.errors++;
                    } else if (eventLog.level === 'W') {
                        draft.warnings++;
                    }
                }
                break;
            }
            case SELECT_MODULE: {
                let moduleName = action.payload;
                let userId = draft.filters.userId;
                draft.filters.module = moduleName;

                draft.errors = draft.items.filter(item =>
                    (moduleName === __ANY_MODULE__ || moduleName === item.module)
                    && (userId === __ANY_USER__ || userId === item.createdById)
                    && item.level === 'E').length;
                draft.warnings = draft.items.filter(item =>
                    (moduleName === __ANY_MODULE__ || moduleName === item.module)
                    && (userId === __ANY_USER__ || userId === item.createdById)
                    && item.level === 'W').length;
                break;
            }
            case SELECT_USER: {
                let moduleName = draft.filters.module;
                let userId = action.payload;
                draft.filters.userId = userId;

                draft.errors = draft.items.filter(item =>
                    (moduleName === __ANY_MODULE__ || moduleName === item.module)
                    && (userId === __ANY_USER__ || userId === item.createdById)
                    && item.level === 'E').length;
                draft.warnings = draft.items.filter(item =>
                    (moduleName === __ANY_MODULE__ || moduleName === item.module)
                    && (userId === __ANY_USER__ || userId === item.createdById)
                    && item.level === 'W').length;
                break;
            }
            case CLEAR_ALL: {
                draft.items = [];
                draft.errors = 0;
                draft.warnings = 0;
                draft.userOptions = initUserOptions;
                draft.moduleOptions = initModuleOptions;
                draft.filters = {
                    userId: __ANY_USER__,
                    module: __ANY_MODULE__,
                    errorsOnly: false,
                    warningsOnly: false
                };
                moduleCache = {};
                userCache = {};
                break;
            }
            case FILTER_BY_ERRORS: {
                draft.filters.errorsOnly = !draft.filters.errorsOnly;
                break;
            }
            case FILTER_BY_WARNINGS: {
                draft.filters.warningsOnly = !draft.filters.warningsOnly;
                break;
            }
            case UPDATE_USER_OPTIONS: {
                let { id, name } = action.payload;
                if (!draft.userOptions.find(option => option.value === id)) {
                    draft.userOptions.push({value: id, text: name});
                }
                break;
            }
            case UPDATE_MODULE_OPTIONS: {
                let moduleName = action.payload;
                if (!draft.moduleOptions.find(option => option.value === moduleName)) {
                    draft.moduleOptions.push({ value: moduleName, text: moduleName });
                }
                break;
            }
        }
    })
}

export function recieveLogEvent(logEvent) {
    return (dispatch) => {
        const {
            LVL__c: level,
            TST__c: timestamp,
            NSP__c: namespace,
            MSG__c: message,
            TRC__c: trace,
            CreatedById: createdById
        } = logEvent.data.payload;

        let item = {
            level,
            timestamp,
            namespace,
            message,
            trace,
            createdById,
            replayId: logEvent.data.event.replayId,
        };

        let namespaceColor = namespaceColorCache[namespace];
        if (!namespaceColor && namespace) {
            namespaceColor = selectColor(namespace);
            namespaceColorCache[namespace] = namespaceColor;
        }
        item.namespaceColor = namespaceColor;

        let moduleName = moduleCache[namespace];
        if (!moduleName && namespace) {
            let index = namespace.indexOf(':');
            if (index === -1) {
                moduleName = namespace;
                moduleCache[namespace] = namespace;
            } else {
                moduleName = namespace.substring(0, index);
                moduleCache[namespace] = moduleName;
            }
            if (moduleCache)
            dispatch({ type: UPDATE_MODULE_OPTIONS, payload: moduleName });
        }
        item.module = moduleName;
        dispatch({ type: RECIEVE_LOGS, payload: item });

        if (!userCache[createdById]) {
            userCache[createdById] = createdById;
            getUser({ userId: createdById })
                .then(result => {
                    let user = {
                        id: result.Id,
                        name: result.Name,
                    };
                    userCache[createdById] = user;
                    dispatch({ type: UPDATE_USER_OPTIONS, payload: user });
                })
                .catch(error => {
                });
        }
    };
}

export function fitlerByErrors() {
    return { type: FILTER_BY_ERRORS };
}

export function fitlerByWarnings() {
    return { type: FILTER_BY_WARNINGS };
}

export function selectModule(moduleName) {
    return { type: SELECT_MODULE, payload: moduleName };
}

export function selectUser(userId) {
    return { type: SELECT_USER, payload: userId };
}

export function clearAll() {
    return { type: CLEAR_ALL };
}
