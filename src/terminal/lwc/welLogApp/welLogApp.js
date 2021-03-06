import { LightningElement, api, track } from 'lwc';
import { store, recieveLogEvent, __DO_NOT_USE__ActionTypes } from 'c/welLogRedux';
import { loadStyle } from 'lightning/platformResourceLoader';
import resource from '@salesforce/resourceUrl/WELLogViewer';

export default class WelLogApp extends LightningElement {
    static isResourceLoaded = false;

    @api height = 260;
    @api isSubscribing = false;
    @track isFullscreen = false;
    @track shouldAnimating = false;
    initComponentWithStore = false;

    @api addLogEvent(logEvent) {
        if (logEvent != null) {
            store.dispatch(recieveLogEvent(logEvent));
        }
    }

    get fixedHeightStyle() {
        return `height: ${this.height}px`;
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

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        this.shouldAnimating = true;
    }

    connectedCallback() {
        if (WelLogApp.isResourceLoaded) {
            return;
        }
        WelLogApp.isResourceLoaded = true;

        loadStyle(this, resource + '/fontawesome/css/all.min.css')
        .then(() => {})
        .catch(() => {});
    }

    renderedCallback() {
        if (!this.initComponentWithStore) {
            store.dispatch({
                type: __DO_NOT_USE__ActionTypes.INIT
            });
            this.initComponentWithStore = true;
        }
    }
}
