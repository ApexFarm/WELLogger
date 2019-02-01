import { LightningElement, api, track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import resource from '@salesforce/resourceUrl/WELLogViewer';

export default class WelLogTerminal extends LightningElement {
    @api
    isSubscribing = false;
    @api
    isFullscreen = false;
    @track
    isScrollLocked = false;
    isResourceLoaded = false;
    logListCmp;

    @api
    addLogEvent(event) {
        if (!this.logListCmp) {
            this.logListCmp = this.template.querySelector('c-wel-log-terminal-list');
        }
        this.logListCmp.addLogEvent(event);
    }

    connectedCallback() {
        if (this.isResourceLoaded) {
            return;
        }
        this.isResourceLoaded = true;

        loadStyle(this, resource + '/fontawesome/css/all.min.css')
        .then(() => {})
        .catch(() => {});
    }

    toggleScrollLock() {
        this.isScrollLocked = !this.isScrollLocked;
    }

    toggleFullscreen(event) {
        this.dispatchEvent(new CustomEvent('togglefullscreen', {
            detail: { event },
        }));
    }

    toggleSubscribe(event) {
        this.dispatchEvent(new CustomEvent('togglesubscribe', {
            detail: { event },
        }));
    }
}
