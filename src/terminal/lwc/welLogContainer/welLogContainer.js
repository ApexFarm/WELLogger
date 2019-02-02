import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';
import { fireEvent } from 'c/welLogPubsub';

export default class WelLogContainer extends LightningElement {
    @api isSubscribing = false;
    @api height = 260;
    @track isFullscreen = false;
    @track shouldAnimating = false;
    @wire(CurrentPageReference) pageRef;

    @api addLogEvent(event) {
        if (event != null) {
            fireEvent(this.pageRef, 'logEventAdded', event);
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
}
