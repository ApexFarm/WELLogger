import { LightningElement, api, track } from 'lwc';

export default class WelLogEventContainer extends LightningElement {
    @api
    name = 'WELLog';
    @api
    isSubscribing = false;
    @track
    logEvents = [];

    @api
    set lastLogEvent(event) {
        this.logEvents.push(event);
        console.log(this.logEvents);
    }

    get lastLogEvent() {
        return this.logEvents[this.logEvent.length -1];
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
