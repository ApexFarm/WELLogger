import { LightningElement, api, track, wire } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/welLogPubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class WelLogTerminalList extends LightningElement {
    @api isScrollLocked = false;
    @track logEvents = [];
    @wire(CurrentPageReference) pageRef;

    @api clearOutput() {
        this.logEvents.length = 0;
    }

    scroll() {
        if (!this.isScrollLocked) {
            const li = this.template.querySelector('li:last-child');
            if (li) {
                li.scrollIntoViewIfNeeded();
            }
        }
    }

    handleLogEventAdded(logEvent) {
        if (logEvent != null) {
            this.logEvents.push(logEvent);
        }
    }

    connectedCallback() {
        registerListener('logEventAdded', this.handleLogEventAdded, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    renderedCallback() {
        // this.scroll();
    }
}
