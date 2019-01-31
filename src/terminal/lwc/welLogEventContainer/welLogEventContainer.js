import { LightningElement, api, track } from 'lwc';

export default class WelLogEventContainer extends LightningElement {
    @api
    isSubscribing = false;
    @track
    logEvents = [];

    @api
    addLogEvent(event) {
        if (event != null) {
            this.logEvents.push(event);
        }
    }

    get toggleButtonLabel() {
        return this.isSubscribing ? 'Unsubscribe' : 'Subscribe';
    }

    handleToggleButtonClick(event) {
        const toggleSubscription = new CustomEvent('togglesubscription', {
            detail: { event }
        });
        this.dispatchEvent(toggleSubscription);
    }
}
