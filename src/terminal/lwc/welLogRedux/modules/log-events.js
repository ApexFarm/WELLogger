import produce from '../lib/immer';

const RECIEVE = 'wel/log-events/RECIEVE';

export default function reducer(state = {items:[]}, action = {}) {
    return produce(state, draft => {
        switch (action.type) {
            case RECIEVE: {
                draft.items.push(action.payload);
                break;
            }
          }
    })
}

export function recieveLogEvent(logEvent) {
  return { type: RECIEVE, payload: logEvent };
}
