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
    @track
    isResourceLoaded = false;
    logListCmp;

    @api
    addLogEvent(event) {
        if (!this.logListCmp) {
            this.logListCmp = this.template.querySelector('c-wel-log-terminal-list');
        }
        this.logListCmp.addLogEvent(event);
    }

    get subscribeClass() {
        return this.isSubscribing ? 'fas fa-pause-circle' : 'fas fa-play-circle';
    }

    get subscribeTitle() {
        return this.isSubscribing ? 'Unsubscribe' : 'Subscribe';
    }

    handleSubscribeClick(event) {
        this.dispatchEvent(new CustomEvent('togglesubscribe', {
            detail: { event }
        }));
    }

    get fullscreenClass() {
        return this.isFullscreen ? 'fas fa-window-minimize' : 'fas fa-window-maximize';
    }

    get fullscreenTitle() {
        return this.isFullscreen ?  'Restore Window' : 'Maximize Window';
    }

    handleFullscreenClick(event) {
        this.dispatchEvent(new CustomEvent('togglefullscreen', {
            detail: { event }
        }));
    }

    get scrollLockClass() {
        return this.isScrollLocked ? 'fas fa-lock-open' : 'fas fa-lock';
    }

    handleScrollLockClick() {
        this.isScrollLocked = !this.isScrollLocked;
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
