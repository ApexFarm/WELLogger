import { LightningElement, api, track } from 'lwc';

export default class WelLogTerminalList extends LightningElement {
    @track
    logEvents = [];
    @api
    isScrollLocked = false;

    @api
    addLogEvent(event) {
        if (event != null) {
            this.logEvents.push(event);
        }
    }

    scroll() {
        if (!this.isScrollLocked) {
            const li = this.template.querySelector('li:last-child');
            if (li) {
                li.scrollIntoViewIfNeeded();
            }
        }
    }

    renderedCallback() {
        this.scroll();
    }
}
