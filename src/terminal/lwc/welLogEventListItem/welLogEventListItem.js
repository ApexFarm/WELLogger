import { LightningElement, api } from 'lwc';

const tzoffset = (new Date()).getTimezoneOffset() * 60000;
const lvlMap = {
    'D': 'DEBUG',
    'I': 'INFO',
    'W': 'WARN',
    'E': 'ERROR',
    'F': 'FINE',
    'N': 'NONE',
};

export default class WelLogEventListItem extends LightningElement {
    replayId;
    level;
    time;
    log;
    logEvent;

    @api set item(logEvent) {
        var { payload:log, event } = logEvent.data;
        this.logEvent = logEvent;
        this.replayId = event.replayId;
        this.log = log;
        this.level = lvlMap[log.LVL__c];
        this.time = (new Date(log.TST__c - tzoffset))
            .toISOString().slice(11, -1);
    }

    get item() {
        return this.logEvent;
    }

    get lineClass() {
        return `line ${this.level}`;
    }
}
