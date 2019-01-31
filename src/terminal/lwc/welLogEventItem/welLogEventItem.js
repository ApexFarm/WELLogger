import { LightningElement, api } from 'lwc';

export default class WelLogEventItem extends LightningElement {
    static tzoffset = (new Date()).getTimezoneOffset() * 60000;
    static lvlMap = {
        'D': 'DEBUG',
        'I': 'INFO',
        'W': 'WARN',
        'E': 'ERROR',
        'F': 'FINE',
        'N': 'NONE',
    };

    @api
    log;
    level;
    time;

    @api
    set item(item) {
        this.level = WelLogEventItem.lvlMap[item.LVL__c];
        this.time = (new Date(item.TST__c - WelLogEventItem.tzoffset)).toISOString().slice(11, -1);
        this.log = item;
    }

    get item() {
        return this.log;
    }

    get levelClass() {
        return `level ${this.level}`;
    }
}
