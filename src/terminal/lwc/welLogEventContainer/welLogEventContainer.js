import { LightningElement, api, track } from 'lwc';

export default class WelLogEventContainer extends LightningElement {
    @api
    isSubscribing = false;
    @api
    isFullscreen = false;
    @track
    logEvents = [];

    @api
    addLogEvent(event) {
        if (event != null) {
            this.logEvents.push(event);
        }
    }

    get subscribeLabel() {
        return this.isSubscribing ? 'Unsubscribe' : 'Subscribe';
    }

    get fullscreenLabel() {
        return this.isFullscreen ? 'Min' : 'Max';
    }

    handleSubscribeClick(event) {
        this.dispatchEvent(new CustomEvent('togglesubscribe', {
            detail: { event }
        }));
    }

    handleFullscreenClick(event) {
        this.dispatchEvent(new CustomEvent('togglefullscreen', {
            detail: { event }
        }));
    }
}
