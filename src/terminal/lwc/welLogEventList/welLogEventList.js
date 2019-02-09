import { LightningElement, api, track } from 'lwc';
import { store } from 'c/welLogRedux';

export default class WelLogEventList extends LightningElement {
    @api isScrollLocked = false;
    @track logEvents = [];
    unsubscribe;

    @api clearOutput() {
        this.logEvents.length = 0;
    }

    scroll() {
        if (!this.isScrollLocked) {
            const li = this.template.querySelector('li:last-child');
            if (li) {
                li.scrollIntoView(false);
            }
        }
    }

    connectedCallback() {
        this.unsubscribe = store.subscribe(() => {
            let { logEvents } = store.getState();
            this.logEvents = logEvents.items;
        });
    }

    disconnectedCallback() {
        this.unsubscribe();
    }

    renderedCallback() {
        this.scroll();
    }
}
