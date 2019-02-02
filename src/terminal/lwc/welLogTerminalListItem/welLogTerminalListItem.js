import { LightningElement, api } from 'lwc';

export default class WelLogTerminalListItem extends LightningElement {
    static tzoffset = (new Date()).getTimezoneOffset() * 60000;
    static lvlMap = {
        'D': 'DEBUG',
        'I': 'INFO',
        'W': 'WARN',
        'E': 'ERROR',
        'F': 'FINE',
        'N': 'NONE',
    };

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
        this.level = WelLogTerminalListItem.lvlMap[log.LVL__c];
        this.time = (new Date(log.TST__c - WelLogTerminalListItem.tzoffset))
            .toISOString().slice(11, -1);
    }

    get item() {
        return this.logEvent;
    }

    get levelClass() {
        return `level ${this.level}`;
    }
}
