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
    @api filterModule;
    @api filtreUserid;
    level;
    time;
    logEvent;

    @api set item(logEvent) {
        this.logEvent = logEvent;
        this.level = lvlMap[logEvent.level];
        this.time = (new Date(logEvent.timestamp - tzoffset))
            .toISOString().slice(11, -1);
    }

    get item() {
        return this.logEvent;
    }

    get lineClass() {
        return `line ${this.level}`;
    }

    get displayNone() {
        if ((this.filterModule === '-- Any Module --'
            || this.filterModule === this.logEvent.module)
            && (this.filtreUserid === '-- Any User --'
            || this.filtreUserid === this.logEvent.createdById)) {
            return null;
        }
        return 'display:none;';
    }

    get namespaceColor() {
        return `color: ${this.logEvent.namespaceColor};`;
    }
}