import { LightningElement, api, track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import resource from '@salesforce/resourceUrl/WELLogViewer';

export default class WelLogTerminal extends LightningElement {
    @api isSubscribing = false;
    @api isFullscreen = false;
    @track isScrollLocked = false;
    isResourceLoaded = false;

    toggleScrollLock() {
        this.isScrollLocked = !this.isScrollLocked;
    }

    toggleSubscribe(event) {
        this.dispatchEvent(new CustomEvent('togglesubscribe', {
            detail: { event },
            bubbles: true,
            composed: true,
        }));
    }

    toggleFullscreen(event) {
        this.dispatchEvent(new CustomEvent('togglefullscreen', {
            detail: { event },
        }));
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
}
