import { LightningElement, api, track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import resource from '@salesforce/resourceUrl/WELLogViewer';

export default class WelLogTerminal extends LightningElement {
    @api
    isSubscribing = false;
    @api
    isFullscreen = false;
    @track
    logEvents = [];
    @track
    isResourceLoaded = false;

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

    connectedCallback() {
        if (this.isResourceLoaded) {
            return;
        }
        this.isResourceLoaded = true;

        loadStyle(this, resource + '/fontawesome/css/all.min.css').catch(() => {});
    }
}
