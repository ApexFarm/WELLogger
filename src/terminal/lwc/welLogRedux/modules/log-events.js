import produce from '../lib/immer';

const RECIEVE = 'wel/log-events/RECIEVE';
const FILTER_BY_ERRORS = 'wel/log-events/FILTER_BY_ERRORS';
const FILTER_BY_WARNINGS = 'wel/log-events/FILTER_BY_WARNINGS';
const SELECT_MODULE = 'wel/log-events/SELECT_MODULE';
const initState = {
    items:[],
    errors: 0,
    warnings: 0,
    moduleNames: ['all'],
    moduleNameCache: {},
    filters: {
        selectedModule: 'all',
        errorsOnly: false,
        warningsOnly: false
    }
};

export default function reducer(state = initState, action = {}) {
    return produce(state, draft => {
        switch (action.type) {
            case RECIEVE: {
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

                draft.items.push(eventLog);
                if (eventLog.level === 'E') {
                    draft.errors++;
                } else if (eventLog.level === 'W') {
                    draft.warnings++;
                }

                let moduleName = draft.moduleNameCache[eventLog.namespace];
                if (!moduleName && eventLog.namespace) {
                    let index = eventLog.namespace.indexOf(':');
                    if (index === -1) {
                        moduleName = eventLog.namespace;
                        draft.moduleNameCache[eventLog.namespace] = eventLog.namespace;
                    } else {
                        moduleName = eventLog.namespace.substring(0, index);
                        draft.moduleNameCache[eventLog.namespace] = moduleName;
                    }
                    if (!draft.moduleNames.includes(moduleName)) {
                        draft.moduleNames.push(moduleName);
                    }
                }
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
            case SELECT_MODULE: {
                draft.filters.selectedModule = action.payload;
                break;
            }
        }
    })
}

export function recieveLogEvent(logEvent) {
    return { type: RECIEVE, payload: logEvent };
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
