import { LightningElement, api, track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import resource from '@salesforce/resourceUrl/WELLogViewer';

export default class WelLogTerminal extends LightningElement {
    @api
    height = 320;
    @api
    isSubscribing = false;
    @track
    isFullscreen = false;
    @track
    shouldAnimating = false;
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

    get containerClass() {
        var className;
        if (this.isFullscreen) {
            if (this.shouldAnimating) {
                className = 'wel-container';
            } else {
                className = 'wel-container fullscreen';
            }
        } else {
            if (this.shouldAnimating) {
                className = 'wel-container fitscreen';
            } else {
                className = 'wel-container';
            }
        }
        return className;
    }

    get fixedHeightStyle() {
        return `height: ${this.height}px`;
    }

    get screenSizeStyle() {
        var timeoutId;
        var style;
        if (this.isFullscreen) {
            if (this.shouldAnimating) {
                const eleContainer = this.template.querySelector('div.wel-positioner');
                const rect = eleContainer.getBoundingClientRect();
                style = `left:${rect.left}px; top:${rect.top}px; `
                    + `width:${rect.width}px; height:${rect.height}px; position:fixed; z-index:5000;`;
                timeoutId = window.setTimeout(() => { // eslint-disable-line @lwc/lwc/no-async-operation
                    this.shouldAnimating = false;
                    window.clearTimeout(timeoutId);
                }, 0);
            } else {
                style = 'position:fixed; z-index:5000;';
            }
        } else {
            if (this.shouldAnimating) {
                const eleContainer = this.template.querySelector('div.wel-positioner');
                const rect = eleContainer.getBoundingClientRect();
                style = `left:${rect.left}px; top:${rect.top}px; `
                    + `width:${rect.width}px; height:${rect.height}px; position:fixed; z-index:5000;`;
                timeoutId = window.setTimeout(() => { // eslint-disable-line @lwc/lwc/no-async-operation
                    this.shouldAnimating = false;
                    window.clearTimeout(timeoutId);
                }, 250);
            }  else {
                style = 'position:absolute; z-index:0;';
            }
        }
        return style;
    }

    toggleScrollLock() {
        this.isScrollLocked = !this.isScrollLocked;
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        this.shouldAnimating = true;
    }

    toggleSubscribe(event) {
        this.dispatchEvent(new CustomEvent('togglesubscribe', {
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
