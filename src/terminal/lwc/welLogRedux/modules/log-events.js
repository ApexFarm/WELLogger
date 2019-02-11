import produce from '../lib/immer';
import { selectColor } from '../lib/colors';

const RECIEVE_LOGS = 'wel/log-events/RECIEVE_LOGS';
const FILTER_BY_ERRORS = 'wel/log-events/FILTER_BY_ERRORS';
const FILTER_BY_WARNINGS = 'wel/log-events/FILTER_BY_WARNINGS';
const SELECT_MODULE = 'wel/log-events/SELECT_MODULE';
const SELECT_USER = 'wel/log-events/SELECT_USER';
const CLEAR_ALL = 'wel/log-events/CLEAR_ALL';

const moduleNameCache = {};
const namespaceColorCache = {};

const initState = {
    items: [],
    errors: 0,
    warnings: 0,
    userIds: ['-- Any User --'],
    modules: ['-- Any Module --'],
    filters: {
        userId: '-- Any User --',
        module: '-- Any Module --',
        errorsOnly: false,
        warningsOnly: false
    }
};

export default function reducer(state = initState, action = {}) {
    return produce(state, draft => {
        switch (action.type) {
            case RECIEVE_LOGS: {
                const {
                    LVL__c,
                    TST__c,
                    NSP__c,
                    MSG__c,
                    TRC__c,
                    CreatedById
                } = action.payload.data.payload;
                let eventLog = {
                    level: LVL__c,
                    timestamp: TST__c,
                    namespace: NSP__c,
                    message: MSG__c,
                    trace: TRC__c,
                    createdById: CreatedById,
                    replayId: action.payload.data.event.replayId,
                };

                let moduleName = moduleNameCache[eventLog.namespace];
                if (!moduleName && eventLog.namespace) {
                    let index = eventLog.namespace.indexOf(':');
                    if (index === -1) {
                        moduleName = eventLog.namespace;
                        moduleNameCache[eventLog.namespace] = eventLog.namespace;
                    } else {
                        moduleName = eventLog.namespace.substring(0, index);
                        moduleNameCache[eventLog.namespace] = moduleName;
                    }
                    if (!draft.modules.includes(moduleName)) {
                        draft.modules.push(moduleName);
                    }
                }
                eventLog.module = moduleName;

                let namespaceColor = namespaceColorCache[eventLog.namespace];
                if (!namespaceColor && eventLog.namespace) {
                    namespaceColor = selectColor(eventLog.namespace);
                    namespaceColorCache[eventLog.namespace] = namespaceColor;
                }
                eventLog.namespaceColor = namespaceColor;

                draft.items.push(eventLog);

                if (!draft.userIds.includes(eventLog.createdById)) {
                    draft.userIds.push(eventLog.createdById);
                }

                if ((draft.filters.module === '-- Any Module --'
                    || draft.filters.module === eventLog.module)
                    && (draft.filters.userId === '-- Any User --'
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
                    (moduleName === '-- Any Module --' || moduleName === item.module)
                    && (userId === '-- Any User --' || userId === item.createdById)
                    && item.level === 'E').length;
                draft.warnings = draft.items.filter(item =>
                    (moduleName === '-- Any Module --' || moduleName === item.module)
                    && (userId === '-- Any User --' || userId === item.createdById)
                    && item.level === 'W').length;
                break;
            }
            case SELECT_USER: {
                let moduleName = draft.filters.module;
                let userId = action.payload;
                draft.filters.userId = userId;

                draft.errors = draft.items.filter(item =>
                    (moduleName === '-- Any Module --' || moduleName === item.module)
                    && (userId === '-- Any User --' || userId === item.createdById)
                    && item.level === 'E').length;
                draft.warnings = draft.items.filter(item =>
                    (moduleName === '-- Any Module --' || moduleName === item.module)
                    && (userId === '-- Any User --' || userId === item.createdById)
                    && item.level === 'W').length;
                break;
            }
            case CLEAR_ALL: {
                draft.items = [];
                draft.errors = 0;
                draft.warnings = 0;
                draft.userIds = ['-- Any User --'];
                draft.modules = ['-- Any Module --'];
                draft.filters = {
                    userId: '-- Any User --',
                    module: '-- Any Module --',
                    errorsOnly: false,
                    warningsOnly: false
                };
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
        }
    })
}

export function recieveLogEvent(logEvent) {
    return { type: RECIEVE_LOGS, payload: logEvent };
}

export function fitlerByErrors() {
    return { type: FILTER_BY_ERRORS };
}

export function fitlerByWarnings() {
    return { type: FILTER_BY_WARNINGS};
}

export function selectModule(moduleName) {
    return { type: SELECT_MODULE, payload: moduleName};
}

export function selectUser(userId) {
    return { type: SELECT_USER, payload: userId};
}

export function clearAll() {
    return { type: CLEAR_ALL };
}
