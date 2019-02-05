import { LightningElement, api, track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import resource from '@salesforce/resourceUrl/WELLogViewer';

export default class WelLogEventView extends LightningElement {
    @api isSubscribing = false;
    @api isFullscreen = false;
    @track isScrollLocked = false;
    @track showErrorOnly = false;
    @track showWarningOnly = false;
    @track showOutput = true;
    @track showChart = false;
    @track modules = ['main', 'sample', 'test'];
    isResourceLoaded = false;

    get levelFilterClass() {
        if (this.showErrorOnly && this.showWarningOnly) {
            return 'ERROR WARN';
        } else if (this.showErrorOnly) {
            return 'ERROR';
        } else if (this.showWarningOnly) {
            return 'WARN';
        }
        return 'ALL';
    }

    toggleMenu(event) {
        this.showOutput = event.target.label === 'OUTPUT';
        this.showChart = event.target.label === 'CHART';
    }

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

    handleClearOutput() {
        this.template.querySelector('c-wel-log-terminal-list').clearOutput();
    }

    toggleErrors() {
        this.showErrorOnly = !this.showErrorOnly;
    }

    toggleWarnings() {
        this.showWarningOnly = !this.showWarningOnly;
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
